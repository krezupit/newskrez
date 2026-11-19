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

    await db
      .update(schema.reels)
      .set({ likesCount: sql`${schema.reels.likesCount} + 1` })
      .where(eq(schema.reels.id, reelId));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error liking reel:", err);
    return NextResponse.json({ error: "Failed to record like" }, { status: 500 });
  }
}
