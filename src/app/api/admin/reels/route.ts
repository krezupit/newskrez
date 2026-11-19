import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, schema } from "@/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { extractYouTubeId, getYouTubeEmbedUrl } from "@/lib/reels/youtube";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";
    const category = searchParams.get("cat") || "all";

    const whereConditions = [];
    if (status !== "all") {
      whereConditions.push(eq(schema.reels.status, status));
    }
    if (category !== "all") {
      whereConditions.push(eq(schema.reels.categorySlug, category));
    }

    const allReels = await db.query.reels.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      orderBy: [desc(schema.reels.id)],
      limit: 100,
    });

    const sources = await db.query.reelSources.findMany({
      orderBy: [schema.reelSources.name],
    });

    const recentLogs = await db.query.reelImportLogs.findMany({
      orderBy: [desc(schema.reelImportLogs.id)],
      limit: 15,
    });

    // Summary Metrics
    const [totalCountRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.reels);
    const [publishedCountRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.reels)
      .where(eq(schema.reels.status, "Published"));
    const [pendingCountRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.reels)
      .where(eq(schema.reels.status, "Pending Review"));
    const [viewsCountRow] = await db
      .select({ sum: sql<number>`COALESCE(sum(${schema.reels.viewsCount}), 0)` })
      .from(schema.reels);

    return NextResponse.json({
      success: true,
      reels: allReels,
      sources,
      logs: recentLogs,
      metrics: {
        total: Number(totalCountRow?.count || 0),
        published: Number(publishedCountRow?.count || 0),
        pending: Number(pendingCountRow?.count || 0),
        totalViews: Number(viewsCountRow?.sum || 0),
        activeSources: sources.filter((s) => s.isEnabled).length,
      },
    });
  } catch (err: any) {
    console.error("Error in GET /api/admin/reels:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch admin reels" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      videoUrl,
      videoType = "youtube",
      categorySlug = "general-news",
      categoryName = "General News",
      relatedArticleId = null,
      status = "Published",
      rightsStatus = "Authorized Embed",
    } = body;

    if (!title || !videoUrl) {
      return NextResponse.json({ error: "Title and Video URL are required" }, { status: 400 });
    }

    let externalId: string | null = null;
    let thumbnailUrl: string | null = null;
    let embedUrl = videoUrl;

    if (videoType === "youtube") {
      externalId = extractYouTubeId(videoUrl);
      if (externalId) {
        thumbnailUrl = `https://i.ytimg.com/vi/${externalId}/hqdefault.jpg`;
        embedUrl = getYouTubeEmbedUrl(externalId);
      }
    }

    const slug = `${title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 150)}-${Date.now().toString().slice(-6)}`;

    await db.insert(schema.reels).values({
      title,
      slug,
      description: description || null,
      videoUrl,
      videoType,
      externalId,
      thumbnailUrl,
      durationSeconds: 45,
      aspectRatio: "9:16",
      sourceName: "NewsKrez Editorial Desk",
      sourceUrl: videoUrl,
      categorySlug,
      categoryName,
      relatedArticleId: relatedArticleId ? Number(relatedArticleId) : null,
      status,
      rightsStatus,
      viewsCount: 0,
      likesCount: 0,
      sharesCount: 0,
      metadata: JSON.stringify({ embedUrl }),
      publishedAt: status === "Published" ? new Date() : null,
    });

    return NextResponse.json({ success: true, message: "Reel created successfully" });
  } catch (err: any) {
    console.error("Error creating reel:", err);
    return NextResponse.json({ error: err.message || "Failed to create reel" }, { status: 500 });
  }
}
