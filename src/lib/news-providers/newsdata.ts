import { NormalizedProviderArticle, ProviderFetchOptions, ProviderFetchResult } from "./types";
import { normalizeRawArticle } from "./normalizer";

const NEWSDATA_BASE_URL = "https://newsdata.io/api/1/latest";

const NEWSDATA_CATEGORY_MAP: Record<string, { category?: string; query?: string; country?: string }> = {
  "general-news": { category: "top" },
  "breaking-news": { category: "top" },
  "trending-news": { category: "top" },
  "world-news": { category: "world" },
  "india-news": { country: "in" },
  politics: { category: "politics" },
  "business-economy": { category: "business" },
  sports: { category: "sports" },
  entertainment: { category: "entertainment" },
  education: { category: "education" },
  science: { category: "science" },
  environment: { category: "environment" },
  "government-updates": { category: "politics", query: "government policy" },
  pharmaceutical: { category: "health", query: "pharmaceutical OR drug" },
  "medical-devices": { category: "health", query: "medical device OR diagnostics" },
  "fda-news": { category: "health", query: "FDA OR recall" },
  "who-healthcare": { category: "health", query: "WHO OR healthcare" },
  technology: { category: "technology" },
  "regulatory-intelligence": { category: "business", query: "regulatory compliance" },
};

export async function fetchNewsData(options: ProviderFetchOptions = {}): Promise<ProviderFetchResult> {
  const startTime = Date.now();
  const apiKey = process.env.NEWSDATA_API_KEY;

  if (!apiKey) {
    return {
      provider: "newsdata",
      success: false,
      httpStatus: 400,
      articles: [],
      errorMessage: "NEWSDATA_API_KEY is not configured in environment.",
      executionTimeMs: Date.now() - startTime,
    };
  }

  const categorySlug = options.categorySlug || "general-news";
  const mapping = NEWSDATA_CATEGORY_MAP[categorySlug] || { category: "top" };

  try {
    const url = new URL(NEWSDATA_BASE_URL);
    url.searchParams.set("apikey", apiKey);
    url.searchParams.set("language", options.language || "en");

    if (mapping.category) {
      url.searchParams.set("category", mapping.category);
    }
    if (mapping.country || options.country) {
      url.searchParams.set("country", options.country || mapping.country || "us");
    }
    if (mapping.query || options.searchQuery) {
      const q = [options.searchQuery, mapping.query].filter(Boolean).join(" ");
      if (q) url.searchParams.set("q", q);
    }

    if (options.page) {
      url.searchParams.set("page", String(options.page));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "NewsKrez-Intelligence/1.0 (+https://newskrez.com)",
      },
    });
    clearTimeout(timeout);

    const executionTimeMs = Date.now() - startTime;
    const remainingHeader =
      res.headers.get("x_api_limit_remaining") ||
      res.headers.get("x-ratelimit-remaining");
    const quotaRemaining = remainingHeader ? parseInt(remainingHeader, 10) : undefined;

    if (!res.ok) {
      const errText = await res.text();
      return {
        provider: "newsdata",
        success: false,
        httpStatus: res.status,
        articles: [],
        quotaRemaining,
        errorMessage: `NewsData.io error (${res.status}): ${errText.slice(0, 150)}`,
        executionTimeMs,
      };
    }

    const data = await res.json();
    if (data.status !== "success" || !Array.isArray(data.results)) {
      return {
        provider: "newsdata",
        success: false,
        httpStatus: res.status,
        articles: [],
        quotaRemaining,
        errorMessage: data.message || "Invalid response format from NewsData.io",
        executionTimeMs,
      };
    }

    const articles: NormalizedProviderArticle[] = data.results.map((item: any, idx: number) => {
      const rawCountry = Array.isArray(item.country) ? item.country[0] : item.country;

      return normalizeRawArticle({
        provider: "newsdata",
        externalId: String(item.article_id || `newsdata-${Date.now()}-${idx}`),
        title: item.title || "Untitled Intelligence Record",
        description: item.description || item.content?.slice(0, 300) || null,
        content: item.content || item.description || null,
        sourceUrl: item.link || "https://newsdata.io",
        sourceName: item.source_name || item.source_id || "NewsData News Wire",
        author: Array.isArray(item.creator) ? item.creator.join(", ") : item.creator || null,
        imageUrl: item.image_url || null,
        publishedAt: item.pubDate || new Date().toISOString(),
        categorySlug,
        country: rawCountry || options.country || "Global",
        language: item.language || options.language || "en",
        isBreaking: categorySlug === "breaking-news",
      });
    });

    return {
      provider: "newsdata",
      success: true,
      httpStatus: res.status,
      totalResults: data.totalResults || articles.length,
      articles,
      quotaRemaining,
      executionTimeMs,
      nextPage: data.nextPage || undefined,
    };
  } catch (err: any) {
    return {
      provider: "newsdata",
      success: false,
      httpStatus: 0,
      articles: [],
      errorMessage: err.name === "AbortError" ? "NewsData.io timeout (12s)" : err.message,
      executionTimeMs: Date.now() - startTime,
    };
  }
}
