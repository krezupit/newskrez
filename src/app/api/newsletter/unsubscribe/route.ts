import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, email } = body;

    if (!token && !email) {
      return NextResponse.json(
        { error: "Token or email is required to unsubscribe." },
        { status: 400 }
      );
    }

    const subscriber = token
      ? await db.query.newsletterSubscribers.findFirst({
          where: eq(schema.newsletterSubscribers.token, token),
        })
      : await db.query.newsletterSubscribers.findFirst({
          where: eq(schema.newsletterSubscribers.email, email.toLowerCase().trim()),
        });

    if (!subscriber) {
      return NextResponse.json(
        { error: "Subscriber not found or already removed." },
        { status: 404 }
      );
    }

    await db
      .update(schema.newsletterSubscribers)
      .set({
        isActive: false,
        unsubscribedAt: new Date(),
      })
      .where(eq(schema.newsletterSubscribers.id, subscriber.id));

    return NextResponse.json({
      success: true,
      message: `Successfully unsubscribed ${subscriber.email} from all NewsKrez email notifications.`,
    });
  } catch (error: any) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "Failed to process unsubscribe request." },
      { status: 500 }
    );
  }
}
