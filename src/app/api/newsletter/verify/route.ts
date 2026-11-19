import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/email/mailer";
import { renderWelcomeEmail } from "@/lib/email/templates";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "newskrez.com";
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/newsletter?error=missing_token`);
  }

  try {
    const subscriber = await db.query.newsletterSubscribers.findFirst({
      where: eq(schema.newsletterSubscribers.token, token),
    });

    if (!subscriber) {
      return NextResponse.redirect(`${baseUrl}/newsletter?error=invalid_token`);
    }

    if (!subscriber.isVerified) {
      // Mark as verified and active
      await db
        .update(schema.newsletterSubscribers)
        .set({ isVerified: true, isActive: true })
        .where(eq(schema.newsletterSubscribers.id, subscriber.id));

      // Dispatch Welcome Email now that they are verified
      try {
        const prefs = (subscriber.preferences as string[]) || ["General News", "Regulatory"];
        const { subject, html, text } = renderWelcomeEmail(
          subscriber.email,
          prefs,
          subscriber.frequency,
          subscriber.token,
          baseUrl
        );

        await sendEmail({
          to: subscriber.email,
          subject,
          html,
          text,
          emailType: "welcome",
          metadata: { subscriberId: subscriber.id, event: "email_verified" },
        });
      } catch (mailErr) {
        console.warn("Error sending welcome email after verification:", mailErr);
      }
    }

    return NextResponse.redirect(`${baseUrl}/newsletter?verified=true`);
  } catch (error) {
    console.error("Subscription verification error:", error);
    return NextResponse.redirect(`${baseUrl}/newsletter?error=server_error`);
  }
}
