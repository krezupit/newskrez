import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const subscriber = await db.query.newsletterSubscribers.findFirst({
    where: eq(schema.newsletterSubscribers.token, token),
  });

  if (!subscriber) {
    return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
  }

  return NextResponse.json({
    email: subscriber.email,
    frequency: subscriber.frequency,
    preferences: subscriber.preferences || [],
    isActive: subscriber.isActive,
    isVerified: subscriber.isVerified,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, frequency, preferences, isActive } = body;

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const subscriber = await db.query.newsletterSubscribers.findFirst({
      where: eq(schema.newsletterSubscribers.token, token),
    });

    if (!subscriber) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (frequency !== undefined) updateData.frequency = frequency;
    if (preferences !== undefined) updateData.preferences = preferences;
    if (isActive !== undefined) {
      updateData.isActive = isActive;
      if (!isActive) updateData.unsubscribedAt = new Date();
      else updateData.unsubscribedAt = null;
    }

    await db
      .update(schema.newsletterSubscribers)
      .set(updateData)
      .where(eq(schema.newsletterSubscribers.id, subscriber.id));

    return NextResponse.json({
      success: true,
      message: "Subscription preferences updated successfully.",
    });
  } catch (error: any) {
    console.error("Preferences update error:", error);
    return NextResponse.json(
      { error: "Failed to update preferences." },
      { status: 500 }
    );
  }
}
