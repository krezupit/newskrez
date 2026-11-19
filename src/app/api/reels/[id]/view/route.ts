import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, sql } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reelId = parseInt(params.id, 10);
    if (isNaN(reelId)) {
      return NextResponse.json({ error: "Invalid reel ID" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";

    // 1. Increment reel view count
    await db
      .update(schema.reels)
      .set({ viewsCount: sql`${schema.reels.viewsCount} + 1` })
      .where(eq(schema.reels.id, reelId));

    // 2. Record view log asynchronously
    await db.insert(schema.reelViews).values({
      reelId,
      ipAddress: ip.slice(0, 45),
      userAgent: userAgent.slice(0, 255),
      watchDurationSeconds: 15,
      completed: true,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error logging reel view:", err);
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}
