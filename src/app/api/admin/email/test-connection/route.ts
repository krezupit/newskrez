import { NextRequest, NextResponse } from "next/server";
import { testSmtpConnection } from "@/lib/email/mailer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let customPassword: string | undefined;
    try {
      const body = await req.json();
      if (body?.smtpPassword && typeof body.smtpPassword === "string") {
        customPassword = body.smtpPassword.trim();
      }
    } catch {
      // Empty body is fine, test with existing env password
    }

    const result = await testSmtpConnection(customPassword);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error: any) {
    console.error("Test SMTP connection error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "An unexpected error occurred testing the SMTP connection.",
      },
      { status: 500 }
    );
  }
}
