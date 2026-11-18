import Parser from "rss-parser";
import crypto from "crypto";
import slugify from "slugify";
import { NormalizedItem } from "../types";

const parser = new Parser({
  headers: {
    "User-Agent": "NewsKrez-Feed-Reader/1.0 (+https://newskrez.com)",
    Accept: "application/rss+xml, application/xml, text/xml; q=0.9, */*; q=0.8",
  },
  timeout: 10000,
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
    const rawId = item.guid || item.id || sourceUrl;
    const externalId = rawId.length > 450 ? sha256(rawId) : rawId;
    const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();

    const snippet = item.contentSnippet || item.summary || item.content || "";
    const cleanSnippet = snippet.replace(/<[^>]*>?/gm, "").trim();

    const content = item.content || item["content:encoded"] || `<p>${cleanSnippet}</p>`;

    // Fallback topic imagery
    let featuredImage = "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1000&auto=format&fit=crop&q=80";
    if (categorySlug === "technology") {
      featuredImage = "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=1000&auto=format&fit=crop&q=80";
    } else if (categorySlug === "medical-devices") {
      featuredImage = "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1000&auto=format&fit=crop&q=80";
    } else if (categorySlug === "who-healthcare") {
      featuredImage = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1000&auto=format&fit=crop&q=80";
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
