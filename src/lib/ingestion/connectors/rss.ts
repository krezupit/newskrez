import Parser from "rss-parser";
import crypto from "crypto";
import slugify from "slugify";
import https from "https";
import { NormalizedItem } from "../types";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
      ["enclosure", "enclosure"],
    ],
  },
  headers: {
    "User-Agent": "NewsKrez-Feed-Reader/1.0 (+https://newskrez.com)",
    Accept: "application/rss+xml, application/xml, text/xml; q=0.9, */*; q=0.8",
  },
  requestOptions: {
    agent: httpsAgent,
    rejectUnauthorized: false,
  },
  timeout: 12000,
});

function sha256(str: string): string {
  return crypto.createHash("sha256").update(str).digest("hex");
}

function safeSlug(text: string): string {
  const base = slugify(text, { lower: true, strict: true, trim: true });
  const rand = crypto.randomBytes(3).toString("hex");
  return `${base.slice(0, 80)}-${rand}`;
}

export async function fetchGenericRSS(
  feedUrl: string,
  sourceName: string,
  categorySlug: string,
  limit = 10
): Promise<NormalizedItem[]> {
  const feed = await parser.parseURL(feedUrl);
  const items: NormalizedItem[] = [];

  const entries = (feed.items || []).slice(0, limit);

  for (const item of entries) {
    if (!item.title || !item.link) continue;

    const title = item.title.trim();
    const sourceUrl = item.link.trim();
    const rawId = item.guid || (item as any).id || sourceUrl;
    const externalId = rawId.length > 450 ? sha256(rawId) : rawId;
    const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();

    const snippet = item.contentSnippet || item.summary || item.content || "";
    const cleanSnippet = snippet.replace(/<[^>]*>?/gm, "").trim();

    const content = item.content || (item as any)["content:encoded"] || `<p>${cleanSnippet}</p>`;

    // Fallback topic imagery
    let featuredImage = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000&auto=format&fit=crop&q=80"; // News desk
    if (categorySlug === "technology") {
      featuredImage = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80";
    } else if (categorySlug === "medical-devices") {
      featuredImage = "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1000&auto=format&fit=crop&q=80";
    } else if (categorySlug === "who-healthcare" || categorySlug === "pharmaceutical") {
      featuredImage = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1000&auto=format&fit=crop&q=80";
    } else if (categorySlug === "india-news") {
      featuredImage = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1000&auto=format&fit=crop&q=80";
    } else if (categorySlug === "world-news") {
      featuredImage = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80";
    } else if (categorySlug === "politics" || categorySlug === "government-updates") {
      featuredImage = "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1000&auto=format&fit=crop&q=80";
    } else if (categorySlug === "business-economy") {
      featuredImage = "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1000&auto=format&fit=crop&q=80";
    } else if (categorySlug === "sports") {
      featuredImage = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1000&auto=format&fit=crop&q=80";
    } else if (categorySlug === "entertainment") {
      featuredImage = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80";
    } else if (categorySlug === "education") {
      featuredImage = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&auto=format&fit=crop&q=80";
    } else if (categorySlug === "science") {
      featuredImage = "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=1000&auto=format&fit=crop&q=80";
    } else if (categorySlug === "environment") {
      featuredImage = "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1000&auto=format&fit=crop&q=80";
    } else if (categorySlug === "breaking-news" || categorySlug === "trending-news") {
      featuredImage = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000&auto=format&fit=crop&q=80";
    }

    // Dynamic RSS media extraction if present in feed
    try {
      const anyItem = item as any;
      const mediaUrl =
        anyItem.enclosure?.url ||
        anyItem.mediaContent?.[0]?.url ||
        anyItem.mediaContent?.[0]?.$?.url ||
        anyItem["media:content"]?.$?.url ||
        anyItem.mediaThumbnail?.[0]?.url ||
        anyItem.mediaThumbnail?.[0]?.$?.url;

      if (mediaUrl && typeof mediaUrl === "string" && mediaUrl.startsWith("http")) {
        featuredImage = mediaUrl;
      }
    } catch (e) {
      // Keep default topic imagery
    }

    items.push({
      externalId,
      title,
      slug: safeSlug(title),
      excerpt: cleanSnippet.slice(0, 220) || "Official global report published.",
      content: content.startsWith("<") ? content : `<p>${content}</p>`,
      featuredImage,
      sourceUrl,
      sourceUrlHash: sha256(sourceUrl),
      sourceName,
      categorySlug,
      publishedAt: isNaN(pubDate.getTime()) ? new Date() : pubDate,
      isBreaking: false,
    });
  }

  return items;
}
