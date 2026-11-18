import { NormalizedProviderArticle, ProviderFetchOptions, ProviderFetchResult } from "./types";
import { normalizeRawArticle } from "./normalizer";

const GNEWS_BASE_URL = "https://gnews.io/api/v4";

// Category mappings for GNews native categories
const GNEWS_CATEGORY_MAP: Record<string, { category?: string; query?: string; country?: string }> = {
  "general-news": { category: "general" },
  "breaking-news": { category: "general" },
  "trending-news": { category: "general" },
  "world-news": { category: "world" },
  "india-news": { category: "nation", country: "in" },
  politics: { query: "politics government election" },
  "business-economy": { category: "business" },
  sports: { category: "sports" },
  entertainment: { category: "entertainment" },
  education: { query: "education universities academia research" },
  science: { category: "science" },
  environment: { query: "environment climate renewable energy conservation" },
  "government-updates": { query: "government policy official gazette regulation" },
  pharmaceutical: { query: "pharmaceutical drug approval biotechnology clinical trial" },
  "medical-devices": { query: "medical device FDA 510k diagnostics MedTech" },
  "fda-news": { query: "FDA recall warning letter drug approval" },
  "who-healthcare": { category: "health" },
  technology: { category: "technology" },
  "regulatory-intelligence": { query: "regulatory compliance GMP ISO GxP inspection" },
};

export async function fetchGNews(options: ProviderFetchOptions = {}): Promise<ProviderFetchResult> {
  const startTime = Date.now();
  const apiKey = process.env.GNEWS_API_KEY;

  if (!apiKey) {
    return {
      provider: "gnews",
      success: false,
      httpStatus: 400,
      articles: [],
      errorMessage: "GNEWS_API_KEY is not configured in environment.",
      executionTimeMs: Date.now() - startTime,
    };
  }

  const categorySlug = options.categorySlug || "general-news";
  const mapping = GNEWS_CATEGORY_MAP[categorySlug] || { category: "general" };
  const limit = Math.min(options.limit || 10, 10); // GNews free plan max 10

  let url: URL;
  if (mapping.query || options.searchQuery) {
    url = new URL(`${GNEWS_BASE_URL}/search`);
    url.searchParams.set("q", options.searchQuery || mapping.query || "news");
  } else {
    url = new URL(`${GNEWS_BASE_URL}/top-headlines`);
    if (mapping.category) url.searchParams.set("category", mapping.category);
  }

  url.searchParams.set("lang", options.language || "en");
  if (mapping.country || options.country) {
    url.searchParams.set("country", options.country || mapping.country || "us");
  }
  url.searchParams.set("max", String(limit));
  url.searchParams.set("apikey", apiKey);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "NewsKrez-Intelligence/1.0 (+https://newskrez.com)",
      },
      next: { revalidate: 0 },
    });

    clearTimeout(timeoutId);

    const data = await res.json();

    if (!res.ok) {
      return {
        provider: "gnews",
        success: false,
        httpStatus: res.status,
        articles: [],
        errorMessage: data.errors?.[0] || data.message || `GNews returned HTTP ${res.status}`,
        executionTimeMs: Date.now() - startTime,
      };
    }

    const rawArticles: any[] = data.articles || [];
    const normalized: NormalizedProviderArticle[] = rawArticles.map((item) =>
      normalizeRawArticle({
        provider: "gnews",
        externalId: item.id || item.url,
        title: item.title,
        description: item.description,
        content: item.content,
        sourceUrl: item.url,
        sourceName: item.source?.name,
        imageUrl: item.image,
        publishedAt: item.publishedAt,
        categorySlug,
        country: options.country || mapping.country || null,
        language: item.lang || options.language || "en",
      })
    );

    return {
      provider: "gnews",
      success: true,
      httpStatus: res.status,
      totalResults: data.totalArticles || normalized.length,
      articles: normalized,
      executionTimeMs: Date.now() - startTime,
    };
  } catch (err: any) {
    return {
      provider: "gnews",
      success: false,
      httpStatus: 500,
      articles: [],
      errorMessage: err.name === "AbortError" ? "GNews request timed out after 12s" : err.message,
      executionTimeMs: Date.now() - startTime,
    };
  }
}
