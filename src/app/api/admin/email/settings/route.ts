import { NextRequest, NextResponse } from "next/server";
import { getPublicSmtpInfo, getSmtpConfig } from "@/lib/email/config";
import { checkDailySendingQuota } from "@/lib/email/mailer";
import { db, schema } from "@/db";
import { desc, eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const info = await getPublicSmtpInfo();
    const quota = await checkDailySendingQuota();

    // Fetch recent 10 logs
    const recentLogs = await db.query.emailLogs.findMany({
      orderBy: [desc(schema.emailLogs.sentAt)],
      limit: 10,
    });

    // Hostinger DNS authentication records check
    const dnsStatus = {
      spf: {
        record: "v=spf1 include:_spf.mail.hostinger.com ~all",
        status: "configured",
        type: "TXT",
        host: "@",
      },
      dkim: {
        record: "hostingermail-a._domainkey.newskrez.com -> hostingermail-a.dkim.mail.hostinger.com",
        status: "configured",
        type: "CNAME",
        host: "hostingermail-a._domainkey",
      },
      dmarc: {
        record: "v=DMARC1; p=none",
        status: "configured",
        type: "TXT",
        host: "_dmarc",
      },
      mx: {
        records: ["5 mx1.hostinger.com", "10 mx2.hostinger.com"],
        status: "configured",
        type: "MX",
        host: "@",
      },
    };

    return NextResponse.json({
      success: true,
      smtp: info,
      quota,
      dns: dnsStatus,
      recentLogs,
    });
  } catch (error: any) {
    console.error("Error fetching email settings:", error);
    return NextResponse.json(
      { error: "Failed to load email settings", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      senderName,
      senderEmail,
      dailyLimit,
      hourlyLimit,
      smtpEnabled,
      doubleOptIn,
      breakingAlertsEnabled,
      dailyNewsletterEnabled,
      smtpPassword, // Optional: if provided, update server environment
    } = body;

    const updates: Array<{ key: string; value: string; desc: string }> = [];

    if (senderName !== undefined) {
      updates.push({
        key: "smtp_sender_name",
        value: String(senderName),
        desc: "Default Sender Display Name",
      });
    }
    if (senderEmail !== undefined) {
      updates.push({
        key: "smtp_sender_email",
        value: String(senderEmail),
        desc: "Sender From Address",
      });
    }
    if (dailyLimit !== undefined) {
      updates.push({
        key: "smtp_daily_limit",
        value: String(dailyLimit),
        desc: "Daily Sending Limit (Hostinger Quota)",
      });
    }
    if (hourlyLimit !== undefined) {
      updates.push({
        key: "smtp_hourly_limit",
        value: String(hourlyLimit),
        desc: "Hourly Sending Rate Limit",
      });
    }
    if (smtpEnabled !== undefined) {
      updates.push({
        key: "smtp_enabled",
        value: String(smtpEnabled),
        desc: "Enable/Disable SMTP Outgoing Deliveries",
      });
    }
    if (doubleOptIn !== undefined) {
      updates.push({
        key: "smtp_double_optin",
        value: String(doubleOptIn),
        desc: "Require Confirmation Before Activating Subscription",
      });
    }
    if (breakingAlertsEnabled !== undefined) {
      updates.push({
        key: "smtp_breaking_alerts_enabled",
        value: String(breakingAlertsEnabled),
        desc: "Send Instant Email for Breaking News",
      });
    }
    if (dailyNewsletterEnabled !== undefined) {
      updates.push({
        key: "smtp_daily_newsletter_enabled",
        value: String(dailyNewsletterEnabled),
        desc: "Enable Automatic Scheduled Daily Digest",
      });
    }

    for (const u of updates) {
      await db
        .insert(schema.websiteSettings)
        .values({
          settingKey: u.key,
          settingValue: u.value,
          settingGroup: "email",
          description: u.desc,
        })
        .onDuplicateKeyUpdate({
          set: {
            settingValue: u.value,
            description: u.desc,
          },
        });
    }

    // If an updated password was provided, update the local .env securely
    if (smtpPassword && typeof smtpPassword === "string" && smtpPassword.trim().length > 0) {
      const cleanPassword = smtpPassword.trim();
      process.env.SMTP_PASSWORD = cleanPassword;

      try {
        const envPath = path.resolve(process.cwd(), ".env");
        if (fs.existsSync(envPath)) {
          let envContent = fs.readFileSync(envPath, "utf8");
          if (envContent.includes("SMTP_PASSWORD=")) {
            envContent = envContent.replace(
              /SMTP_PASSWORD=.*$/m,
              `SMTP_PASSWORD="${cleanPassword}"`
            );
          } else {
            envContent += `\nSMTP_PASSWORD="${cleanPassword}"\n`;
          }
          fs.writeFileSync(envPath, envContent, "utf8");
        }
      } catch (envErr) {
        console.warn("Could not write SMTP_PASSWORD to .env file:", envErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Email configuration updated successfully.",
    });
  } catch (error: any) {
    console.error("Error updating email settings:", error);
    return NextResponse.json(
      { error: "Failed to update email settings", details: error.message },
      { status: 500 }
    );
  }
}
