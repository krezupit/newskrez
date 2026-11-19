import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { runReelsIngestion } from "@/lib/reels/engine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sources = await db.query.reelSources.findMany({
      orderBy: [schema.reelSources.name],
    });

    return NextResponse.json({ success: true, sources });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch sources" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, sourceId, name, code, channelId, defaultCategorySlug, dailyPublishLimit, requiresEditorialApproval } = body;

    // 1. Trigger manual fetch now
    if (action === "fetch_now") {
      const result = await runReelsIngestion(sourceId ? Number(sourceId) : undefined);
      return NextResponse.json({ success: true, result });
    }

    // 2. Toggle active state
    if (action === "toggle") {
      const source = await db.query.reelSources.findFirst({
        where: eq(schema.reelSources.id, Number(sourceId)),
      });
      if (!source) {
        return NextResponse.json({ error: "Source not found" }, { status: 404 });
      }
      await db
        .update(schema.reelSources)
        .set({ isEnabled: !source.isEnabled, updatedAt: new Date() })
        .where(eq(schema.reelSources.id, Number(sourceId)));

      return NextResponse.json({ success: true, isEnabled: !source.isEnabled });
    }

    // 3. Create new video source
    if (!name || !code) {
      return NextResponse.json({ error: "Source name and code are required" }, { status: 400 });
    }

    await db.insert(schema.reelSources).values({
      name,
      code,
      sourceType: "youtube_channel",
      channelId: channelId || null,
      defaultCategorySlug: defaultCategorySlug || "general-news",
      dailyPublishLimit: dailyPublishLimit ? Number(dailyPublishLimit) : 10,
      requiresEditorialApproval: Boolean(requiresEditorialApproval),
      isEnabled: true,
    });

    return NextResponse.json({ success: true, message: "Source added successfully" });
  } catch (err: any) {
    console.error("Error managing reel sources:", err);
    return NextResponse.json({ error: err.message || "Failed to manage reel sources" }, { status: 500 });
  }
}
