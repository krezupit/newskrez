import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import crypto from "crypto";

const subscribeSchema = z.object({
  email: z.string().email(),
  frequency: z.enum(["daily", "weekly", "breaking_alerts"]).default("daily"),
  preferences: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    const { email, frequency, preferences } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    // Check if already subscribed
    const existing = await db.query.newsletterSubscribers.findFirst({
      where: eq(schema.newsletterSubscribers.email, cleanEmail),
    });

    if (existing) {
      if (!existing.isActive) {
        // Reactivate
        await db
          .update(schema.newsletterSubscribers)
          .set({ isActive: true, unsubscribedAt: null, frequency })
          .where(eq(schema.newsletterSubscribers.id, existing.id));
      }
      return NextResponse.json({
        success: true,
        message: "You are already subscribed to NewsKrez intelligence updates.",
      });
    }

    // Insert new subscriber
    const token = crypto.randomBytes(32).toString("hex");
    await db.insert(schema.newsletterSubscribers).values({
      email: cleanEmail,
      token,
      isVerified: true, // auto-verify for instant access
      frequency,
      preferences: preferences || ["pharma", "devices", "fda", "who", "regulatory"],
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: "Subscription confirmed! Welcome to NewsKrez Intelligence.",
    });
  } catch (error: any) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Unable to process subscription. Please try again later." },
      { status: 500 }
    );
  }
}
