import { db, schema } from "@/db";
import { eq, sql, desc } from "drizzle-orm";
import { ProviderCode, ProviderFetchOptions, ProviderFetchResult, ProviderStatusInfo } from "./types";
import { fetchGNews } from "./gnews";
import { fetchNewsAPI } from "./newsapi";
import { fetchCurrents } from "./currents";
import { fetchMediastack } from "./mediastack";
import { fetchNewsData } from "./newsdata";
import { isDuplicateArticle, createSafeSlug } from "./deduplication";

export * from "./types";
export * from "./deduplication";
export * from "./normalizer";
export { fetchGNews } from "./gnews";
export { fetchNewsAPI } from "./newsapi";
export { fetchCurrents } from "./currents";
export { fetchMediastack } from "./mediastack";
export { fetchNewsData } from "./newsdata";

export const SUPPORTED_PROVIDERS: ProviderCode[] = [
  "gnews",
  "newsapi",
  "currents",
  "mediastack",
  "newsdata",
];

export async function fetchFromProvider(
  providerCode: ProviderCode,
  options: ProviderFetchOptions = {}
): Promise<ProviderFetchResult> {
  switch (providerCode) {
    case "gnews":
      return await fetchGNews(options);
    case "newsapi":
      return await fetchNewsAPI(options);
    case "currents":
      return await fetchCurrents(options);
    case "mediastack":
      return await fetchMediastack(options);
    case "newsdata":
      return await fetchNewsData(options);
    default:
      return {
        provider: providerCode,
        success: false,
        httpStatus: 400,
        articles: [],
        errorMessage: `Unknown provider code: ${providerCode}`,
        executionTimeMs: 0,
      };
  }
}

/**
 * Mask API Key for safe frontend display (e.g. "1ce7••••080a")
 */
export function maskApiKey(key: string | undefined | null): string {
  if (!key) return "Not Configured";
  if (key.length <= 8) return "••••••••";
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}

/**
 * Get environment variable key name for provider
 */
export function getProviderEnvKeyName(code: ProviderCode): string {
  switch (code) {
    case "gnews":
      return "GNEWS_API_KEY";
    case "newsapi":
      return "NEWSAPI_API_KEY";
    case "currents":
      return "CURRENTS_API_KEY";
    case "mediastack":
      return "MEDIASTACK_API_KEY";
    case "newsdata":
      return "NEWSDATA_API_KEY";
  }
}

/**
 * Retrieve database status along with masked environment key status
 */
export async function getProvidersStatusList(): Promise<ProviderStatusInfo[]> {
  const dbProviders = await db.query.newsProviders.findMany({
    orderBy: (p, { asc }) => [asc(p.priority)],
  });

  const dbMap = new Map(dbProviders.map((p) => [p.code as ProviderCode, p]));

  return SUPPORTED_PROVIDERS.map((code) => {
    const envKeyName = getProviderEnvKeyName(code);
    const rawKey = process.env[envKeyName];
    const isConfigured = !!rawKey && rawKey.trim().length > 0;
    const maskedKey = maskApiKey(rawKey);

    const record = dbMap.get(code);

    return {
      code,
      name:
        record?.name ||
        (code === "gnews"
          ? "GNews"
          : code === "newsapi"
          ? "NewsAPI.org"
          : code === "currents"
          ? "Currents API"
          : code === "mediastack"
          ? "Mediastack"
          : "NewsData.io"),
      websiteUrl:
        record?.websiteUrl ||
        (code === "gnews"
          ? "https://gnews.io"
          : code === "newsapi"
          ? "https://newsapi.org"
          : code === "currents"
          ? "https://currentsapi.services"
          : code === "mediastack"
          ? "https://mediastack.com"
          : "https://newsdata.io"),
      isEnabled: record ? record.isEnabled : true,
      isConfigured,
      maskedKey,
      priority: record?.priority ?? 1,
      quotaUsedToday: record?.quotaUsedToday ?? 0,
      quotaRemaining: record?.quotaRemaining ?? null,
      rateLimitPerDay: record?.rateLimitPerDay ?? null,
      lastFetchAt: record?.lastFetchAt ? record.lastFetchAt.toISOString() : null,
      lastSuccessAt: record?.lastSuccessAt ? record.lastSuccessAt.toISOString() : null,
      lastStatus: record?.lastStatus ?? "idle",
      lastErrorMessage: record?.lastErrorMessage ?? null,
      totalArticlesImported: record?.totalArticlesImported ?? 0,
    };
  });
}

/**
 * Test connectivity and latency for a single provider
 */
export async function testProviderConnection(providerCode: ProviderCode): Promise<ProviderFetchResult> {
  return await fetchFromProvider(providerCode, {
    categorySlug: "general-news",
    limit: 2,
  });
}

/**
 * Core ingestion worker for a single provider
 */
export async function ingestProviderNews(
  providerCode: ProviderCode,
  categorySlug: string = "general-news",
  autoPublish: boolean = true
): Promise<{
  success: boolean;
  provider: ProviderCode;
  category: string;
  articlesFetched: number;
  articlesInserted: number;
  articlesSkipped: number;
  executionTimeMs: number;
  errorMessage?: string;
}> {
  const startTime = Date.now();

  // 1. Check if provider is enabled
  const providerRecord = await db.query.newsProviders.findFirst({
    where: eq(schema.newsProviders.code, providerCode),
  });

  if (providerRecord && !providerRecord.isEnabled) {
    return {
      success: false,
      provider: providerCode,
      category: categorySlug,
      articlesFetched: 0,
      articlesInserted: 0,
      articlesSkipped: 0,
      executionTimeMs: Date.now() - startTime,
      errorMessage: `Provider '${providerCode}' is disabled in settings.`,
    };
  }

  // 2. Fetch raw news
  const fetchResult = await fetchFromProvider(providerCode, {
    categorySlug,
    limit: 10,
  });

  let insertedCount = 0;
  let skippedCount = 0;

  // 3. Resolve target category in database
  let categoryId = 1; // Default fallback to General News
  try {
    const cat = await db.query.categories.findFirst({
      where: eq(schema.categories.slug, categorySlug),
    });
    if (cat) {
      categoryId = cat.id;
    } else {
      const generalCat = await db.query.categories.findFirst({
        where: eq(schema.categories.slug, "general-news"),
      });
      if (generalCat) categoryId = generalCat.id;
    }
  } catch (e) {
    console.error("Error looking up category:", e);
  }

  // 4. Process articles if fetch succeeded
  if (fetchResult.success && fetchResult.articles.length > 0) {
    for (const article of fetchResult.articles) {
      try {
        // Check deduplication
        const isDuplicate = await isDuplicateArticle(article.sourceUrlHash, article.externalId);
        if (isDuplicate) {
          skippedCount++;
          continue;
        }

        // Generate unique URL-safe slug
        const slug = createSafeSlug(article.title);

        const wordCount = article.content.split(/\s+/).length;
        const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200));

        // Insert into articles table
        await db.insert(schema.articles).values({
          title: article.title.slice(0, 300),
          slug,
          excerpt: article.excerpt,
          content: article.content,
          featuredImage: article.imageUrl || undefined,
          imageCaption: article.sourceName ? `Source: ${article.sourceName}` : "NewsKrez Intelligence Wire",
          status: autoPublish ? "Published" : "Pending Review",
          primaryCategoryId: categoryId,
          provider: article.provider,
          sourceName: article.sourceName.slice(0, 150),
          country: article.country?.slice(0, 50) || "Global",
          language: article.language?.slice(0, 20) || "en",
          sourceUrl: article.sourceUrl,
          sourceUrlHash: article.sourceUrlHash,
          externalRecordId: article.externalId.slice(0, 500),
          canonicalUrl: article.canonicalUrl,
          seoTitle: article.title.slice(0, 160),
          metaDescription: article.excerpt.slice(0, 255),
          isBreaking: article.isBreaking,
          isFeatured: false,
          viewsCount: Math.floor(Math.random() * 45) + 5,
          readingTimeMinutes,
          publishedAt: article.publishedAt,
        });

        insertedCount++;
      } catch (insertErr) {
        console.error(`Failed to insert article '${article.title.slice(0, 40)}':`, insertErr);
        skippedCount++;
      }
    }
  }

  const executionTimeMs = Date.now() - startTime;

  // 5. Update provider state in database
  try {
    const updateData: any = {
      lastFetchAt: new Date(),
      lastStatus: fetchResult.success ? "success" : "error",
      lastErrorMessage: fetchResult.errorMessage || null,
      quotaUsedToday: sql`${schema.newsProviders.quotaUsedToday} + 1`,
      updatedAt: new Date(),
    };

    if (fetchResult.success) {
      updateData.lastSuccessAt = new Date();
      updateData.totalArticlesImported = sql`${schema.newsProviders.totalArticlesImported} + ${insertedCount}`;
    }

    if (fetchResult.quotaRemaining !== undefined) {
      updateData.quotaRemaining = fetchResult.quotaRemaining;
    }

    await db
      .update(schema.newsProviders)
      .set(updateData)
      .where(eq(schema.newsProviders.code, providerCode));
  } catch (dbErr) {
    console.error("Failed to update news_providers status:", dbErr);
  }

  // 6. Record fetch audit log
  try {
    await db.insert(schema.providerFetchLogs).values({
      providerCode,
      endpoint: fetchResult.success ? "API Gateway" : "Error",
      categorySlug,
      status: fetchResult.success ? "success" : "error",
      httpStatus: fetchResult.httpStatus,
      articlesFetched: fetchResult.articles.length,
      articlesInserted: insertedCount,
      articlesSkipped: skippedCount,
      errorMessage: fetchResult.errorMessage || null,
      executionTimeMs,
      fetchedAt: new Date(),
    });
  } catch (logErr) {
    console.error("Failed to insert provider fetch log:", logErr);
  }

  return {
    success: fetchResult.success,
    provider: providerCode,
    category: categorySlug,
    articlesFetched: fetchResult.articles.length,
    articlesInserted: insertedCount,
    articlesSkipped: skippedCount,
    executionTimeMs,
    errorMessage: fetchResult.errorMessage,
  };
}

/**
 * Sequential runner across all active providers for cron/scheduled jobs
 */
export async function ingestAllActiveProviders(): Promise<any[]> {
  const activeProviders = await db.query.newsProviders.findMany({
    where: eq(schema.newsProviders.isEnabled, true),
    orderBy: (p, { asc }) => [asc(p.priority)],
  });

  const results: any[] = [];
  const primaryCategories = [
    "general-news",
    "india-news",
    "world-news",
    "business-economy",
    "pharmaceutical",
    "medical-devices",
    "technology",
  ];

  for (const prov of activeProviders) {
    const code = prov.code as ProviderCode;
    // Rotate category based on current hour to distribute quota nicely
    const currentHour = new Date().getHours();
    const targetCategory = primaryCategories[currentHour % primaryCategories.length];

    try {
      const res = await ingestProviderNews(code, targetCategory, true);
      results.push(res);
    } catch (err: any) {
      results.push({
        success: false,
        provider: code,
        errorMessage: err.message,
      });
    }
  }

  return results;
}
