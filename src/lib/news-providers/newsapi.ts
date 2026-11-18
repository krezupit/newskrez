import { NormalizedProviderArticle, ProviderFetchOptions, ProviderFetchResult } from "./types";
import { normalizeRawArticle } from "./normalizer";

const NEWSAPI_BASE_URL = "https://newsapi.org/v2";

const NEWSAPI_CATEGORY_MAP: Record<string, { category?: string; query?: string; country?: string }> = {
  "general-news": { category: "general" },
  "breaking-news": { category: "general" },
  "trending-news": { category: "general" },
  "india-news": { country: "in" },
  "world-news": { query: "world affairs diplomacy global geopolitics" },
  politics: { query: "politics parliament election government policy" },
  "business-economy": { category: "business" },
  sports: { category: "sports" },
  entertainment: { category: "entertainment" },
  education: { query: "higher education universities academia student research" },
  science: { category: "science" },
  environment: { query: "environment climate change renewable clean energy" },
  "government-updates": { query: "government administration policy circular gazette" },
  pharmaceutical: { query: "pharmaceutical drug approval clinical research oncology" },
  "medical-devices": { query: "medical device 510k PMA clearance MedTech diagnostics" },
  "fda-news": { query: "FDA recall drug warning letter safety communication" },
  "who-healthcare": { category: "health" },
  technology: { category: "technology" },
  "regulatory-intelligence": { query: "regulatory compliance GxP GMP ISO audit inspection" },
};

export async function fetchNewsApi(options: ProviderFetchOptions = {}): Promise<ProviderFetchResult> {
  const startTime = Date.now();
  const apiKey = process.env.NEWSAPI_API_KEY;

  if (!apiKey) {
    return {
      provider: "newsapi",
      success: false,
      httpStatus: 400,
      articles: [],
      errorMessage: "NEWSAPI_API_KEY is not configured in environment.",
      executionTimeMs: Date.now() - startTime,
    };
  }

  const categorySlug = options.categorySlug || "general-news";
  const mapping = NEWSAPI_CATEGORY_MAP[categorySlug] || { category: "general" };
  const limit = Math.min(options.limit || 10, 20);

  let url: URL;
  if (mapping.query || options.searchQuery) {
    url = new URL(`${NEWSAPI_BASE_URL}/everything`);
    url.searchParams.set("q", options.searchQuery || mapping.query || "news");
    url.searchParams.set("sortBy", "publishedAt");
  } else {
    url = new URL(`${NEWSAPI_BASE_URL}/top-headlines`);
    if (mapping.category) url.searchParams.set("category", mapping.category);
    if (mapping.country || options.country) {
      url.searchParams.set("country", options.country || mapping.country || "us");
    }
  }

  url.searchParams.set("language", options.language || "en");
  url.searchParams.set("pageSize", String(limit));
  url.searchParams.set("apiKey", apiKey);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

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

    if (!res.ok || data.status === "error") {
      return {
        provider: "newsapi",
        success: false,
        httpStatus: res.status,
        articles: [],
        errorMessage: data.message || `NewsAPI returned HTTP ${res.status}`,
        executionTimeMs: Date.now() - startTime,
      };
    }

    const rawArticles: any[] = data.articles || [];
    const normalized: NormalizedProviderArticle[] = rawArticles.map((item) =>
      normalizeRawArticle({
        provider: "newsapi",
        externalId: item.url,
        title: item.title,
        description: item.description,
        content: item.content,
        sourceUrl: item.url,
        sourceName: item.source?.name,
        author: item.author,
        imageUrl: item.urlToImage,
        publishedAt: item.publishedAt,
        categorySlug,
        country: options.country || mapping.country || null,
        language: options.language || "en",
      })
    );

    return {
      provider: "newsapi",
      success: true,
      httpStatus: res.status,
      totalResults: data.totalResults || normalized.length,
      articles: normalized,
      executionTimeMs: Date.now() - startTime,
    };
  } catch (err: any) {
    return {
      provider: "newsapi",
      success: false,
      httpStatus: 500,
      articles: [],
      errorMessage: err.name === "AbortError" ? "NewsAPI request timed out after 12s" : err.message,
      executionTimeMs: Date.now() - startTime,
    };
  }
}

export const fetchNewsAPI = fetchNewsApi;
