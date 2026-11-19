import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/mailer";
import { renderTestEmail } from "@/lib/email/templates";
import { z } from "zod";

export const dynamic = "force-dynamic";

const testSendSchema = z.object({
  recipientEmail: z.string().email(),
  smtpPassword: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "newskrez.com";
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

  try {
    const body = await req.json();
    const parsed = testSendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "A valid recipient email address is required." },
        { status: 400 }
      );
    }

    const { recipientEmail, smtpPassword } = parsed.data;
    const nowStr = new Date().toUTCString();

    const { subject, html, text } = renderTestEmail(recipientEmail, nowStr, baseUrl);

    const result = await sendEmail({
      to: recipientEmail,
      subject,
      html,
      text,
      emailType: "test",
      customPassword: smtpPassword,
      metadata: { initiatedBy: "admin_manual_test", timestamp: nowStr },
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email successfully dispatched to ${recipientEmail}! Message ID: ${result.messageId}`,
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: `Failed to deliver test email: ${result.error}`,
          error: result.error,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Test send email error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "An unexpected error occurred sending the test email.",
      },
      { status: 500 }
    );
  }
}
