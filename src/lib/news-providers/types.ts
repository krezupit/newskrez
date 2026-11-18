export type ProviderCode = "gnews" | "newsapi" | "currents" | "mediastack" | "newsdata";

export interface NormalizedProviderArticle {
  externalId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  sourceUrl: string;
  sourceUrlHash: string;
  canonicalUrl: string;
  imageUrl: string | null;
  publishedAt: Date;
  provider: ProviderCode;
  sourceName: string;
  author: string | null;
  categorySlug: string;
  country: string | null;
  language: string;
  isBreaking: boolean;
  status?: "Draft" | "Pending Review" | "Approved" | "Published";
}

export interface ProviderFetchOptions {
  categorySlug?: string;
  limit?: number;
  page?: number | string;
  searchQuery?: string;
  country?: string;
  language?: string;
}

export interface ProviderFetchResult {
  provider: ProviderCode;
  success: boolean;
  httpStatus: number;
  totalResults?: number;
  articles: NormalizedProviderArticle[];
  quotaRemaining?: number;
  quotaLimit?: number;
  errorMessage?: string;
  executionTimeMs: number;
  nextPage?: string;
}

export interface ProviderStatusInfo {
  code: ProviderCode;
  name: string;
  websiteUrl: string;
  isEnabled: boolean;
  isConfigured: boolean;
  maskedKey: string;
  priority: number;
  quotaUsedToday: number;
  quotaRemaining: number | null;
  rateLimitPerDay: number | null;
  lastFetchAt: string | null;
  lastSuccessAt: string | null;
  lastStatus: string;
  lastErrorMessage: string | null;
  totalArticlesImported: number;
}
