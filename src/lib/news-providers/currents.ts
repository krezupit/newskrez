import { NormalizedProviderArticle, ProviderFetchOptions, ProviderFetchResult } from "./types";
import { normalizeRawArticle } from "./normalizer";

const CURRENTS_BASE_URL = "https://api.currentsapi.services/v1";

const CURRENTS_CATEGORY_MAP: Record<string, { category?: string; keywords?: string }> = {
  "general-news": { category: "general" },
  "breaking-news": { category: "general" },
  "trending-news": { category: "general" },
  "world-news": { category: "world" },
  "india-news": { keywords: "India politics economy Delhi Mumbai" },
  politics: { category: "politics" },
  "business-economy": { category: "business" },
  sports: { category: "sports" },
  entertainment: { category: "entertainment" },
  education: { category: "academia" },
  science: { category: "science" },
  environment: { keywords: "environment climate change renewable clean energy" },
  "government-updates": { keywords: "government legislation administrative circular notification" },
  pharmaceutical: { keywords: "pharmaceutical drug approval clinical research therapeutics" },
  "medical-devices": { keywords: "medical device FDA 510k MedTech diagnostic equipment" },
  "fda-news": { keywords: "FDA drug recall medical device safety warning" },
  "who-healthcare": { category: "health" },
  technology: { category: "technology" },
  "regulatory-intelligence": { keywords: "regulatory compliance GMP ISO standards GxP inspection" },
};

export async function fetchCurrents(options: ProviderFetchOptions = {}): Promise<ProviderFetchResult> {
  const startTime = Date.now();
  const apiKey = process.env.CURRENTS_API_KEY;

  if (!apiKey) {
    return {
      provider: "currents",
      success: false,
      httpStatus: 400,
      articles: [],
      errorMessage: "CURRENTS_API_KEY is not configured in environment.",
      executionTimeMs: Date.now() - startTime,
    };
  }

  const categorySlug = options.categorySlug || "general-news";
  const mapping = CURRENTS_CATEGORY_MAP[categorySlug] || { category: "general" };

  let url: URL;
  if (mapping.keywords || options.searchQuery) {
    url = new URL(`${CURRENTS_BASE_URL}/search`);
    url.searchParams.set("keywords", options.searchQuery || mapping.keywords || "news");
  } else {
    url = new URL(`${CURRENTS_BASE_URL}/latest-news`);
    if (mapping.category) url.searchParams.set("category", mapping.category);
  }

  url.searchParams.set("language", options.language || "en");
  url.searchParams.set("apiKey", apiKey);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });

    clearTimeout(timeoutId);

    // Extract live rate-limit quota headers
    const remainingHeader = res.headers.get("x-ratelimit-remaining");
    const limitHeader = res.headers.get("x-ratelimit-limit");
    const quotaRemaining = remainingHeader ? parseInt(remainingHeader, 10) : undefined;
    const quotaLimit = limitHeader ? parseInt(limitHeader, 10) : undefined;

    const data = await res.json();

    if (!res.ok || data.status === "error") {
      return {
        provider: "currents",
        success: false,
        httpStatus: res.status,
        articles: [],
        quotaRemaining,
        quotaLimit,
        errorMessage: data.message || `Currents returned HTTP ${res.status}`,
        executionTimeMs: Date.now() - startTime,
      };
    }

    const rawNews: any[] = data.news || [];
    const limit = options.limit || 10;
    const sliced = rawNews.slice(0, limit);

    const normalized: NormalizedProviderArticle[] = sliced.map((item) =>
      normalizeRawArticle({
        provider: "currents",
        externalId: item.id || item.url,
        title: item.title,
        description: item.description,
        content: item.description,
        sourceUrl: item.url,
        sourceName: item.author || "Currents Wire",
        author: item.author,
        imageUrl: item.image,
        publishedAt: item.published,
        categorySlug,
        country: options.country || null,
        language: item.language || options.language || "en",
      })
    );

    return {
      provider: "currents",
      success: true,
      httpStatus: res.status,
      totalResults: rawNews.length,
      articles: normalized,
      quotaRemaining,
      quotaLimit,
      executionTimeMs: Date.now() - startTime,
    };
  } catch (err: any) {
    return {
      provider: "currents",
      success: false,
      httpStatus: 500,
      articles: [],
      errorMessage: err.name === "AbortError" ? "Currents request timed out after 12s" : err.message,
      executionTimeMs: Date.now() - startTime,
    };
  }
}
