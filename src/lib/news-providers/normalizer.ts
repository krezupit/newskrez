import { normalizeCanonicalUrl, hashUrl, createSafeSlug } from "./deduplication";
import { NormalizedProviderArticle, ProviderCode } from "./types";

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  "general-news": "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000&auto=format&fit=crop&q=80",
  "india-news": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1000&auto=format&fit=crop&q=80",
  "world-news": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80",
  politics: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1000&auto=format&fit=crop&q=80",
  "business-economy": "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1000&auto=format&fit=crop&q=80",
  sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1000&auto=format&fit=crop&q=80",
  entertainment: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80",
  education: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&auto=format&fit=crop&q=80",
  science: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=1000&auto=format&fit=crop&q=80",
  environment: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1000&auto=format&fit=crop&q=80",
  "government-updates": "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1000&auto=format&fit=crop&q=80",
  "breaking-news": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000&auto=format&fit=crop&q=80",
  "trending-news": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000&auto=format&fit=crop&q=80",
  pharmaceutical: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1000&auto=format&fit=crop&q=80",
  "medical-devices": "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1000&auto=format&fit=crop&q=80",
  "fda-news": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1000&auto=format&fit=crop&q=80",
  "who-healthcare": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1000&auto=format&fit=crop&q=80",
  technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80",
  "regulatory-intelligence": "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1000&auto=format&fit=crop&q=80",
};

export function cleanHtmlText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeRawArticle(params: {
  provider: ProviderCode;
  externalId: string;
  title: string;
  description?: string | null;
  content?: string | null;
  sourceUrl: string;
  sourceName?: string | null;
  author?: string | null;
  imageUrl?: string | null;
  publishedAt?: string | Date | null;
  categorySlug: string;
  country?: string | null;
  language?: string;
  isBreaking?: boolean;
}): NormalizedProviderArticle {
  const cleanTitle = cleanHtmlText(params.title);
  const cleanDesc = cleanHtmlText(params.description || "");
  const cleanContent = params.content ? cleanHtmlText(params.content) : cleanDesc;

  const canonicalUrl = normalizeCanonicalUrl(params.sourceUrl);
  const sourceUrlHash = hashUrl(canonicalUrl);

  let validDate = new Date();
  if (params.publishedAt) {
    const d = new Date(params.publishedAt);
    if (!isNaN(d.getTime())) {
      validDate = d;
    }
  }

  // Fallback image selection
  let finalImage = params.imageUrl?.trim() || null;
  if (!finalImage || !finalImage.startsWith("http")) {
    finalImage = CATEGORY_FALLBACK_IMAGES[params.categorySlug] || CATEGORY_FALLBACK_IMAGES["general-news"];
  }

  const excerpt = cleanDesc.slice(0, 240) || cleanContent.slice(0, 240) || "Read the full dispatch from original wire.";

  // Wrap content in semantic paragraphs
  const formattedContent = cleanContent
    ? `<p>${cleanContent}</p>`
    : `<p>${excerpt}</p>`;

  return {
    externalId: params.externalId || sourceUrlHash,
    title: cleanTitle,
    slug: createSafeSlug(cleanTitle),
    excerpt,
    content: formattedContent,
    sourceUrl: params.sourceUrl,
    sourceUrlHash,
    canonicalUrl,
    imageUrl: finalImage,
    publishedAt: validDate,
    provider: params.provider,
    sourceName: params.sourceName?.trim() || "NewsKrez Wire",
    author: params.author?.trim() || null,
    categorySlug: params.categorySlug,
    country: params.country || null,
    language: params.language || "en",
    isBreaking: Boolean(params.isBreaking),
  };
}
