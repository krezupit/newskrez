import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, and, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("cat") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const offset = (page - 1) * limit;

    const whereConditions = [eq(schema.reels.status, "Published")];

    if (category !== "all") {
      whereConditions.push(eq(schema.reels.categorySlug, category));
    }

    const items = await db.query.reels.findMany({
      where: and(...whereConditions),
      orderBy: [desc(schema.reels.publishedAt), desc(schema.reels.id)],
      limit: limit + 1,
      offset,
    });

    const hasMore = items.length > limit;
    const finalItems = hasMore ? items.slice(0, limit) : items;

    // Attach related article info if present
    const articleIds = finalItems
      .map((r) => r.relatedArticleId)
      .filter((id): id is number => typeof id === "number" && id > 0);

    const articleMap = new Map<number, { slug: string; title: string }>();
    if (articleIds.length > 0) {
      const relatedArts = await db.query.articles.findMany({
        where: sql`${schema.articles.id} IN (${sql.join(articleIds.map((id) => sql`${id}`), sql`, `)})`,
      });
      for (const a of relatedArts) {
        articleMap.set(a.id, { slug: a.slug, title: a.title });
      }
    }

    const reelsWithArticles = finalItems.map((r) => {
      const art = r.relatedArticleId ? articleMap.get(r.relatedArticleId) : null;
      let parsedMetadata: any = null;
      if (r.metadata) {
        try {
          parsedMetadata = typeof r.metadata === "string" ? JSON.parse(r.metadata) : r.metadata;
        } catch (_) {}
      }

      return {
        ...r,
        metadata: parsedMetadata,
        relatedArticleSlug: art?.slug || null,
        relatedArticleTitle: art?.title || null,
      };
    });

    return NextResponse.json({
      success: true,
      reels: reelsWithArticles,
      hasMore,
      page,
    });
  } catch (err: any) {
    console.error("Error in GET /api/reels:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch reels" },
      { status: 500 }
    );
  }
}
