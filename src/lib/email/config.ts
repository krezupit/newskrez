import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password?: string;
  fromName: string;
  fromEmail: string;
  dailyLimit: number;
  hourlyLimit: number;
  enabled: boolean;
}

/**
 * Retrieves the active SMTP configuration.
 * Always securely reads password from server-side environment variables.
 * Never leaks the password to client-side.
 */
export async function getSmtpConfig(customPassword?: string): Promise<SmtpConfig> {
  let dbSettingsMap = new Map<string, string>();
  try {
    const dbSettings = await db.query.websiteSettings.findMany({
      where: eq(schema.websiteSettings.settingGroup, "email"),
    });
    dbSettingsMap = new Map(dbSettings.map((s) => [s.settingKey, s.settingValue]));
  } catch (err) {
    // If DB is offline, fall back cleanly to environment variables
    console.warn("Failed to load email settings from DB, using env defaults:", err);
  }

  const host = process.env.SMTP_HOST || dbSettingsMap.get("smtp_host") || "smtp.hostinger.com";
  const port = parseInt(
    process.env.SMTP_PORT || dbSettingsMap.get("smtp_port") || "465",
    10
  );
  const secure =
    process.env.SMTP_SECURE === "false"
      ? false
      : port === 465 || dbSettingsMap.get("smtp_encryption") === "SSL/TLS";

  const user = process.env.SMTP_USER || dbSettingsMap.get("smtp_username") || "alert@newskrez.com";
  const password = customPassword || process.env.SMTP_PASSWORD || "";

  const fromName =
    process.env.SMTP_FROM_NAME || dbSettingsMap.get("smtp_sender_name") || "NewsKrez";
  const fromEmail =
    process.env.SMTP_FROM_EMAIL || dbSettingsMap.get("smtp_sender_email") || "alert@newskrez.com";

  const dailyLimit = parseInt(
    process.env.SMTP_DAILY_LIMIT || dbSettingsMap.get("smtp_daily_limit") || "500",
    10
  );
  const hourlyLimit = parseInt(
    process.env.SMTP_HOURLY_LIMIT || dbSettingsMap.get("smtp_hourly_limit") || "100",
    10
  );

  const enabled =
    (dbSettingsMap.get("smtp_enabled") ?? "true") === "true";

  return {
    host,
    port,
    secure,
    user,
    password,
    fromName,
    fromEmail,
    dailyLimit,
    hourlyLimit,
    enabled,
  };
}

/**
 * Returns safe public metadata about SMTP status (masks the password completely).
 */
export async function getPublicSmtpInfo() {
  const config = await getSmtpConfig();
  return {
    host: config.host,
    port: config.port,
    secure: config.secure,
    encryption: config.secure ? "SSL/TLS" : "STARTTLS",
    username: config.user,
    senderName: config.fromName,
    senderEmail: config.fromEmail,
    dailyLimit: config.dailyLimit,
    hourlyLimit: config.hourlyLimit,
    enabled: config.enabled,
    hasPasswordConfigured: Boolean(process.env.SMTP_PASSWORD && process.env.SMTP_PASSWORD.trim().length > 0),
  };
}
