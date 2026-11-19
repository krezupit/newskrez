import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, schema } from "@/db";
import { eq, desc } from "drizzle-orm";
import { generateReelScriptFromArticle, generateReelVisualMetadata } from "@/lib/reels/generator";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    let { articleId } = body;

    let targetArticle: any = null;

    if (articleId) {
      targetArticle = await db.query.articles.findFirst({
        where: eq(schema.articles.id, Number(articleId)),
      });
    } else {
      // Pick latest published article
      targetArticle = await db.query.articles.findFirst({
        where: eq(schema.articles.status, "Published"),
        orderBy: [desc(schema.articles.publishedAt)],
      });
    }

    if (!targetArticle) {
      return NextResponse.json({ error: "Article not found for reel generation" }, { status: 404 });
    }

    // Lookup primary category name
    let categoryName = "General News";
    let categorySlug = "general-news";
    if (targetArticle.primaryCategoryId) {
      const cat = await db.query.categories.findFirst({
        where: eq(schema.categories.id, targetArticle.primaryCategoryId),
      });
      if (cat) {
        categoryName = cat.name;
        categorySlug = cat.slug;
      }
    }

    // 1. Generate Script
    const script = generateReelScriptFromArticle({
      id: targetArticle.id,
      title: targetArticle.title,
      excerpt: targetArticle.excerpt,
      content: targetArticle.content,
      categoryName,
      categorySlug,
      sourceName: "NewsKrez Intelligence",
      imageUrl: targetArticle.featuredImage,
    });

    // 2. Generate Visual Scene Metadata
    const visualMeta = generateReelVisualMetadata(
      {
        id: targetArticle.id,
        title: targetArticle.title,
        imageUrl: targetArticle.featuredImage,
      },
      script
    );

    // 3. Create Reel Generation Job record
    const [jobResult] = await db.insert(schema.reelGenerationJobs).values({
      articleId: targetArticle.id,
      title: script.headline,
      summary: script.summary,
      scriptText: script.narrationLines.join("\n\n"),
      voiceProvider: "web_speech",
      voiceId: "en-US-Neural2-F",
      videoTemplate: "vertical_news_v1",
      status: "completed",
      thumbnailUrl: targetArticle.featuredImage || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1080&h=1920&fit=crop",
      createdBy: user.userId,
    });

    const isMedicalOrFda =
      categorySlug === "fda-news" ||
      categorySlug === "who-healthcare" ||
      categorySlug === "medical-devices" ||
      categorySlug === "pharmaceutical" ||
      categorySlug === "regulatory-intelligence";

    // Strict compliance rule: FDA/Health reels require review
    const status = isMedicalOrFda ? "Pending Review" : "Published";

    const uniqueSlug = `ai-reel-${targetArticle.slug.slice(0, 100)}-${Date.now().toString().slice(-4)}`;

    // 4. Create Reel Record
    const [reelResult] = await db.insert(schema.reels).values({
      title: script.headline.slice(0, 250),
      slug: uniqueSlug,
      description: script.summary,
      videoUrl: `/api/reels/stream/${targetArticle.id}`,
      videoType: "ai_generated",
      thumbnailUrl: targetArticle.featuredImage || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1080&h=1920&fit=crop",
      durationSeconds: script.suggestedDurationSeconds,
      aspectRatio: "9:16",
      sourceName: "NewsKrez AI Video Lab",
      sourceUrl: `https://newskrez.com/article/${targetArticle.slug}`,
      channelTitle: "NewsKrez Original",
      primaryCategoryId: targetArticle.primaryCategoryId,
      categorySlug,
      categoryName,
      relatedArticleId: targetArticle.id,
      status,
      rightsStatus: "Original AI-Generated",
      viewsCount: 0,
      likesCount: 0,
      sharesCount: 0,
      metadata: JSON.stringify({
        script,
        visualMeta,
        scenes: visualMeta.scenes,
        audioScript: script.narrationLines,
      }),
      publishedAt: status === "Published" ? new Date() : null,
    });

    return NextResponse.json({
      success: true,
      message: `AI Reel created (${status})`,
      script,
      visualMeta,
      status,
    });
  } catch (err: any) {
    console.error("Error generating AI reel:", err);
    return NextResponse.json({ error: err.message || "Failed to generate AI reel" }, { status: 500 });
  }
}
