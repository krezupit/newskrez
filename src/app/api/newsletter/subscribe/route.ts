import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import crypto from "crypto";
import { sendEmail } from "@/lib/email/mailer";
import { renderConfirmationEmail, renderWelcomeEmail } from "@/lib/email/templates";

export const dynamic = "force-dynamic";

const subscribeSchema = z.object({
  email: z.string().email(),
  frequency: z.enum(["daily", "weekly", "breaking_alerts"]).default("daily"),
  preferences: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "newskrez.com";
    const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

    const body = await req.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email address format." },
        { status: 400 }
      );
    }

    const { email, frequency, preferences } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();
    const resolvedPrefs = preferences || [
      "General News",
      "Regulatory Intelligence",
      "Pharmaceutical",
      "Medical Devices",
      "Technology",
    ];

    // Check if double opt-in is enabled in settings
    let doubleOptIn = true;
    try {
      const optSetting = await db.query.websiteSettings.findFirst({
        where: eq(schema.websiteSettings.settingKey, "smtp_double_optin"),
      });
      if (optSetting && optSetting.settingValue === "false") {
        doubleOptIn = false;
      }
    } catch {
      doubleOptIn = true;
    }

    // Check if already subscribed
    const existing = await db.query.newsletterSubscribers.findFirst({
      where: eq(schema.newsletterSubscribers.email, cleanEmail),
    });

    if (existing) {
      if (!existing.isActive) {
        // Reactivate
        await db
          .update(schema.newsletterSubscribers)
          .set({
            isActive: true,
            unsubscribedAt: null,
            frequency,
            preferences: resolvedPrefs,
          })
          .where(eq(schema.newsletterSubscribers.id, existing.id));

        // Send welcome back email
        try {
          const { subject, html, text } = renderWelcomeEmail(
            cleanEmail,
            resolvedPrefs,
            frequency,
            existing.token,
            baseUrl
          );
          await sendEmail({
            to: cleanEmail,
            subject,
            html,
            text,
            emailType: "welcome",
            metadata: { subscriberId: existing.id, action: "reactivated" },
          });
        } catch (mailErr) {
          console.warn("Could not dispatch welcome email:", mailErr);
        }

        return NextResponse.json({
          success: true,
          message: "Welcome back! Your subscription to NewsKrez intelligence updates has been reactivated.",
        });
      }

      return NextResponse.json({
        success: true,
        message: "You are already actively subscribed to NewsKrez intelligence updates.",
      });
    }

    // Insert new subscriber
    const token = crypto.randomBytes(32).toString("hex");
    const isInitiallyVerified = !doubleOptIn;

    const [insertResult] = await db.insert(schema.newsletterSubscribers).values({
      email: cleanEmail,
      token,
      isVerified: isInitiallyVerified,
      frequency,
      preferences: resolvedPrefs,
      isActive: true,
    });

    // Send either Confirmation Email or Instant Welcome Email
    if (doubleOptIn) {
      const { subject, html, text } = renderConfirmationEmail(cleanEmail, token, baseUrl);
      await sendEmail({
        to: cleanEmail,
        subject,
        html,
        text,
        emailType: "confirmation",
        metadata: { token, email: cleanEmail },
      });

      return NextResponse.json({
        success: true,
        message: "Confirmation link sent! Please check your email to verify your subscription.",
        requiresVerification: true,
      });
    } else {
      const { subject, html, text } = renderWelcomeEmail(
        cleanEmail,
        resolvedPrefs,
        frequency,
        token,
        baseUrl
      );
      await sendEmail({
        to: cleanEmail,
        subject,
        html,
        text,
        emailType: "welcome",
        metadata: { token, email: cleanEmail },
      });

      return NextResponse.json({
        success: true,
        message: "Subscription confirmed! Welcome to NewsKrez Intelligence.",
        requiresVerification: false,
      });
    }
  } catch (error: any) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Unable to process subscription. Please try again later." },
      { status: 500 }
    );
  }
}
