import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, schema } from "@/db";
import { eq, desc } from "drizzle-orm";
import {
  getProvidersStatusList,
  testProviderConnection,
  ingestProviderNews,
  ProviderCode,
  SUPPORTED_PROVIDERS,
} from "@/lib/news-providers";

export const dynamic = "force-dynamic";

/**
 * GET: Retrieve list of API news providers with masked credentials, quotas, and recent logs
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const providers = await getProvidersStatusList();

    const recentLogs = await db.query.providerFetchLogs.findMany({
      orderBy: (l, { desc }) => [desc(l.fetchedAt)],
      limit: 25,
    });

    return NextResponse.json({
      success: true,
      providers,
      recentLogs,
    });
  } catch (error: any) {
    console.error("GET /api/admin/api-sources error:", error);
    return NextResponse.json(
      { error: "Failed to load API providers", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST: Execute "test" or "fetch" on a specific provider
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, providerCode, categorySlug = "general-news", autoPublish = true } = body;

    if (!SUPPORTED_PROVIDERS.includes(providerCode as ProviderCode)) {
      return NextResponse.json(
        { error: `Invalid provider code: ${providerCode}` },
        { status: 400 }
      );
    }

    if (action === "test") {
      const testResult = await testProviderConnection(providerCode as ProviderCode);
      return NextResponse.json({
        success: testResult.success,
        provider: providerCode,
        httpStatus: testResult.httpStatus,
        articlesCount: testResult.articles.length,
        quotaRemaining: testResult.quotaRemaining,
        executionTimeMs: testResult.executionTimeMs,
        errorMessage: testResult.errorMessage,
        sampleArticles: testResult.articles.slice(0, 3).map((a) => ({
          title: a.title,
          sourceName: a.sourceName,
          sourceUrl: a.sourceUrl,
          imageUrl: a.imageUrl,
          publishedAt: a.publishedAt,
        })),
      });
    }

    if (action === "fetch") {
      const ingestResult = await ingestProviderNews(
        providerCode as ProviderCode,
        categorySlug,
        autoPublish
      );

      return NextResponse.json({
        success: ingestResult.success,
        provider: providerCode,
        category: ingestResult.category,
        articlesFetched: ingestResult.articlesFetched,
        articlesInserted: ingestResult.articlesInserted,
        articlesSkipped: ingestResult.articlesSkipped,
        executionTimeMs: ingestResult.executionTimeMs,
        errorMessage: ingestResult.errorMessage,
      });
    }

    return NextResponse.json(
      { error: `Unsupported action '${action}'. Expected 'test' or 'fetch'.` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("POST /api/admin/api-sources error:", error);
    return NextResponse.json(
      { error: "API action failed", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT: Update provider settings (isEnabled, priority)
 */
export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { providerCode, isEnabled, priority } = body;

    if (!SUPPORTED_PROVIDERS.includes(providerCode as ProviderCode)) {
      return NextResponse.json(
        { error: `Invalid provider code: ${providerCode}` },
        { status: 400 }
      );
    }

    const updateFields: any = {
      updatedAt: new Date(),
    };

    if (typeof isEnabled === "boolean") {
      updateFields.isEnabled = isEnabled;
    }
    if (typeof priority === "number") {
      updateFields.priority = priority;
    }

    await db
      .update(schema.newsProviders)
      .set(updateFields)
      .where(eq(schema.newsProviders.code, providerCode));

    return NextResponse.json({
      success: true,
      message: `Updated settings for provider '${providerCode}'.`,
    });
  } catch (error: any) {
    console.error("PUT /api/admin/api-sources error:", error);
    return NextResponse.json(
      { error: "Failed to update provider", details: error.message },
      { status: 500 }
    );
  }
}
