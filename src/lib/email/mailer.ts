import nodemailer from "nodemailer";
import { db, schema } from "@/db";
import { getSmtpConfig } from "./config";
import { count, eq, gte, sql } from "drizzle-orm";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  emailType: "test" | "confirmation" | "welcome" | "daily_newsletter" | "breaking_alert";
  metadata?: Record<string, any>;
  customPassword?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Creates a configured Nodemailer Transporter
 */
export async function createEmailTransporter(customPassword?: string) {
  const config = await getSmtpConfig(customPassword);

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure, // true for 465, false for 587
    auth: {
      user: config.user,
      pass: config.password,
    },
    tls: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: true,
    },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });

  return { transporter, config };
}

/**
 * Tests SMTP authentication and socket handshake with smtp.hostinger.com
 */
export async function testSmtpConnection(customPassword?: string): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    const { transporter, config } = await createEmailTransporter(customPassword);

    if (!config.password) {
      return {
        success: false,
        message: "SMTP password is not set. Please configure the SMTP_PASSWORD environment variable or enter it in settings.",
      };
    }

    await transporter.verify();

    return {
      success: true,
      message: `Successfully connected to Hostinger SMTP (${config.host}:${config.port}) and authenticated as ${config.user}!`,
      details: {
        host: config.host,
        port: config.port,
        user: config.user,
        secure: config.secure,
      },
    };
  } catch (error: any) {
    console.error("SMTP verification error:", error);
    let errorMsg = error.message || "Failed to connect to SMTP server";

    if (error.responseCode === 535 || errorMsg.includes("5.7.8") || errorMsg.includes("Authentication failed")) {
      errorMsg = "Authentication failed (535): Invalid username or password for alert@newskrez.com. Please check your SMTP_PASSWORD in Hostinger webmail.";
    } else if (error.code === "ETIMEDOUT" || error.code === "ESOCKETTIMEDOUT") {
      errorMsg = "Connection timed out connecting to smtp.hostinger.com:465. Verify port and firewall rules.";
    } else if (error.code === "ECONNREFUSED") {
      errorMsg = "Connection refused by smtp.hostinger.com:465.";
    }

    return {
      success: false,
      message: errorMsg,
      details: {
        code: error.code,
        responseCode: error.responseCode,
        response: error.response,
      },
    };
  }
}

/**
 * Checks current daily sending limits against Hostinger's quota
 */
export async function checkDailySendingQuota(): Promise<{
  allowed: boolean;
  sentToday: number;
  limit: number;
  remaining: number;
}> {
  const config = await getSmtpConfig();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  try {
    const result = await db
      .select({ count: count() })
      .from(schema.emailLogs)
      .where(
        sql`${schema.emailLogs.status} = 'sent' AND ${schema.emailLogs.sentAt} >= ${startOfToday}`
      );

    const sentToday = result[0]?.count ?? 0;
    const limit = config.dailyLimit || 500;
    const remaining = Math.max(0, limit - sentToday);
    const allowed = sentToday < limit;

    return {
      allowed,
      sentToday,
      limit,
      remaining,
    };
  } catch (error) {
    console.error("Failed to query email logs quota:", error);
    return {
      allowed: true,
      sentToday: 0,
      limit: config.dailyLimit || 500,
      remaining: config.dailyLimit || 500,
    };
  }
}

/**
 * Sends an email with retry logic and logs result to MySQL
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  const { to, subject, html, text, emailType, metadata, customPassword } = options;
  const recipient = Array.isArray(to) ? to.join(", ") : to;

  // 1. Check daily sending quota
  const quota = await checkDailySendingQuota();
  if (!quota.allowed) {
    const errorMsg = `Daily email sending quota reached (${quota.sentToday}/${quota.limit}). Throttling delivery.`;
    await logEmailDelivery({
      recipient,
      subject,
      emailType,
      status: "rate_limited",
      errorMessage: errorMsg,
      metadata,
    });
    return { success: false, error: errorMsg };
  }

  // 2. Transporter creation
  const { transporter, config } = await createEmailTransporter(customPassword);

  if (!config.enabled) {
    return {
      success: false,
      error: "SMTP delivery is disabled in portal settings.",
    };
  }

  if (!config.password) {
    const errorMsg = "SMTP_PASSWORD is missing in server environment variables.";
    await logEmailDelivery({
      recipient,
      subject,
      emailType,
      status: "failed",
      errorMessage: errorMsg,
      metadata,
    });
    return { success: false, error: errorMsg };
  }

  const mailOptions = {
    from: `"${config.fromName}" <${config.fromEmail}>`,
    to: recipient,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, " ").slice(0, 500),
    headers: {
      "X-Mailer": "NewsKrez Intelligence Dispatcher (Hostinger Node)",
      "List-Unsubscribe": `<${process.env.NEXT_PUBLIC_APP_URL || "https://newskrez.com"}/unsubscribe>`,
    },
  };

  // 3. Execution with retry handling
  let attempts = 0;
  const maxAttempts = 2;
  let lastError: any = null;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const info = await transporter.sendMail(mailOptions);

      // Log successful delivery
      await logEmailDelivery({
        recipient,
        subject,
        emailType,
        status: "sent",
        messageId: info.messageId,
        retryCount: attempts - 1,
        metadata,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err: any) {
      lastError = err;
      console.warn(`Email attempt ${attempts}/${maxAttempts} failed:`, err.message);

      if (attempts < maxAttempts) {
        // Wait 1.5 seconds before retrying
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  // If all attempts failed, log failure
  const errorMessage = lastError?.message || "Unknown SMTP delivery error";
  await logEmailDelivery({
    recipient,
    subject,
    emailType,
    status: "failed",
    errorMessage,
    retryCount: attempts - 1,
    metadata,
  });

  return {
    success: false,
    error: errorMessage,
  };
}

/**
 * Logs email delivery status to MySQL email_logs table
 */
async function logEmailDelivery(data: {
  recipient: string;
  subject: string;
  emailType: string;
  status: "sent" | "failed" | "rate_limited";
  errorMessage?: string;
  messageId?: string;
  retryCount?: number;
  metadata?: any;
}) {
  try {
    await db.insert(schema.emailLogs).values({
      recipient: data.recipient.slice(0, 191),
      subject: data.subject.slice(0, 255),
      emailType: data.emailType,
      status: data.status,
      errorMessage: data.errorMessage || null,
      messageId: data.messageId || null,
      retryCount: data.retryCount || 0,
      metadata: data.metadata || null,
    });
  } catch (err) {
    console.error("Failed to insert into email_logs:", err);
  }
}
