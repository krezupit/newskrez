export interface ReelItem {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  videoUrl: string;
  videoType: "youtube" | "mp4" | "ai_generated";
  externalId: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number;
  aspectRatio: string;
  sourceId: number | null;
  sourceName: string | null;
  sourceUrl: string | null;
  channelTitle: string | null;
  primaryCategoryId: number | null;
  categorySlug: string;
  categoryName: string;
  relatedArticleId: number | null;
  relatedArticleSlug?: string | null;
  relatedArticleTitle?: string | null;
  status: "Draft" | "Pending Review" | "Published" | "Archived" | "Rejected";
  rightsStatus: string;
  isFeatured: boolean;
  viewsCount: number;
  likesCount: number;
  sharesCount: number;
  metadata?: any;
  publishedAt: Date | string | null;
  createdAt: Date | string;
}

export interface ReelSourceItem {
  id: number;
  name: string;
  code: string;
  sourceType: "youtube_channel" | "youtube_playlist" | "video_rss" | "api_feed";
  channelId?: string | null;
  playlistId?: string | null;
  feedUrl?: string | null;
  defaultCategorySlug: string;
  isEnabled: boolean;
  requiresEditorialApproval: boolean;
  dailyPublishLimit: number;
  publishedToday: number;
  lastFetchedAt: Date | string | null;
  lastSuccessAt: Date | string | null;
  lastErrorMessage?: string | null;
  totalReelsImported: number;
  createdAt: Date | string;
}

export interface ReelCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface GeneratedReelScript {
  headline: string;
  summary: string;
  hook: string;
  narrationLines: string[];
  keyFacts: string[];
  sourceAttribution: string;
  suggestedDurationSeconds: number;
}
