import { NormalizedProviderArticle, ProviderFetchOptions, ProviderFetchResult } from "./types";
import { normalizeRawArticle } from "./normalizer";

const MEDIASTACK_BASE_URL = "https://api.mediastack.com/v1";

const MEDIASTACK_CATEGORY_MAP: Record<string, { categories?: string; keywords?: string; countries?: string }> = {
  "general-news": { categories: "general" },
  "breaking-news": { categories: "general" },
  "trending-news": { categories: "general" },
  "india-news": { countries: "in" },
  "world-news": { keywords: "international affairs diplomacy world" },
  politics: { keywords: "politics parliament election government" },
  "business-economy": { categories: "business" },
  sports: { categories: "sports" },
  entertainment: { categories: "entertainment" },
  education: { keywords: "university education academia scientific research" },
  science: { categories: "science" },
  environment: { keywords: "climate renewable energy environment conservation" },
  "government-updates": { keywords: "government ministry policy gazette circular" },
  pharmaceutical: { keywords: "pharmaceutical clinical trial drug biotech" },
  "medical-devices": { keywords: "medical device 510k PMA diagnostic imaging" },
  "fda-news": { keywords: "FDA drug recall warning letter safety" },
  "who-healthcare": { categories: "health" },
  technology: { categories: "technology" },
  "regulatory-intelligence": { keywords: "regulatory compliance GMP ISO GxP inspection" },
};

export async function fetchMediastack(options: ProviderFetchOptions = {}): Promise<ProviderFetchResult> {
  const startTime = Date.now();
  const apiKey = process.env.MEDIASTACK_API_KEY;

  if (!apiKey) {
    return {
      provider: "mediastack",
      success: false,
      httpStatus: 400,
      articles: [],
      errorMessage: "MEDIASTACK_API_KEY is not configured in environment.",
      executionTimeMs: Date.now() - startTime,
    };
  }

  const categorySlug = options.categorySlug || "general-news";
  const mapping = MEDIASTACK_CATEGORY_MAP[categorySlug] || { categories: "general" };
  const limit = Math.min(options.limit || 10, 25);

  const url = new URL(`${MEDIASTACK_BASE_URL}/news`);
  url.searchParams.set("access_key", apiKey);
  url.searchParams.set("languages", options.language || "en");
  url.searchParams.set("limit", String(limit));

  if (mapping.categories) url.searchParams.set("categories", mapping.categories);
  if (mapping.keywords || options.searchQuery) {
    url.searchParams.set("keywords", options.searchQuery || mapping.keywords || "news");
  }
  if (mapping.countries || options.country) {
    url.searchParams.set("countries", options.country || mapping.countries || "us");
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    let res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });

    clearTimeout(timeoutId);

    // If HTTPS is restricted on certain Mediastack tiers, fallback cleanly to HTTP
    if (!res.ok && res.status === 403) {
      const httpUrl = new URL(url.toString().replace("https://", "http://"));
      res = await fetch(httpUrl.toString(), {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 },
      });
    }

    // Extract quota headers
    const remainingHeader = res.headers.get("x-quota-remaining");
    const limitHeader = res.headers.get("x-quota-limit");
    const quotaRemaining = remainingHeader ? parseInt(remainingHeader, 10) : undefined;
    const quotaLimit = limitHeader ? parseInt(limitHeader, 10) : undefined;

    const data = await res.json();

    if (!res.ok || data.error) {
      return {
        provider: "mediastack",
        success: false,
        httpStatus: res.status,
        articles: [],
        quotaRemaining,
        quotaLimit,
        errorMessage: data.error?.message || `Mediastack returned HTTP ${res.status}`,
        executionTimeMs: Date.now() - startTime,
      };
    }

    const rawData: any[] = data.data || [];
    const normalized: NormalizedProviderArticle[] = rawData.map((item) =>
      normalizeRawArticle({
        provider: "mediastack",
        externalId: item.url,
        title: item.title,
        description: item.description,
        content: item.description,
        sourceUrl: item.url,
        sourceName: item.source || "Mediastack Source",
        author: item.author,
        imageUrl: item.image,
        publishedAt: item.published_at,
        categorySlug,
        country: item.country || options.country || null,
        language: item.language || options.language || "en",
      })
    );

    return {
      provider: "mediastack",
      success: true,
      httpStatus: res.status,
      totalResults: data.pagination?.total || normalized.length,
      articles: normalized,
      quotaRemaining,
      quotaLimit,
      executionTimeMs: Date.now() - startTime,
    };
  } catch (err: any) {
    return {
      provider: "mediastack",
      success: false,
      httpStatus: 500,
      articles: [],
      errorMessage: err.name === "AbortError" ? "Mediastack request timed out after 12s" : err.message,
      executionTimeMs: Date.now() - startTime,
    };
  }
}
