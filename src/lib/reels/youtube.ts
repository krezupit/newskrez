/**
 * YouTube Utility & Official Embed Connector for NewsKrez Reels
 * Complies with YouTube API Terms of Service & Permitted Embed Guidelines
 */

export interface YouTubeVideoMetadata {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  isShort: boolean;
  videoUrl: string;
  embedUrl: string;
}

/**
 * Extract YouTube Video ID from standard watch URLs, short URLs, or Shorts URLs.
 */
export function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrOrTrimmed(urlOrId)) return null;
  const str = urlOrId.trim();

  // If already an 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }

  // Handle standard YouTube URLs
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const regex of patterns) {
    const match = str.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

function urlOrOrTrimmed(val: any): boolean {
  return typeof val === "string" && val.trim().length > 0;
}

/**
 * Generate official embed URL with parameters optimized for vertical 9:16 Reel feed.
 */
export function getYouTubeEmbedUrl(
  videoId: string,
  options: {
    autoplay?: boolean;
    mute?: boolean;
    loop?: boolean;
    controls?: boolean;
  } = {}
): string {
  const { autoplay = true, mute = true, loop = true, controls = false } = options;
  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    mute: mute ? "1" : "0",
    playsinline: "1",
    controls: controls ? "1" : "0",
    rel: "0",
    modestbranding: "1",
    enablejsapi: "1",
    origin: typeof window !== "undefined" ? window.location.origin : "https://newskrez.com",
  });

  if (loop) {
    params.set("loop", "1");
    params.set("playlist", videoId);
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Detect if video title or description indicates a vertical Short / Reel.
 */
export function isLikelyShort(title: string, description: string, rawUrl?: string): boolean {
  if (rawUrl && rawUrl.includes("/shorts/")) return true;

  const text = `${title} ${description}`.toLowerCase();
  const shortKeywords = [
    "#shorts",
    "#short",
    "#reels",
    "#reel",
    "#youtubeshorts",
    "shorts",
    "reels",
    "quick take",
    "60 seconds",
  ];

  return shortKeywords.some((keyword) => text.includes(keyword));
}

/**
 * Fetch video metadata via YouTube Data API v3 (when API Key is provided)
 */
export async function fetchFromYouTubeApi(
  channelId: string,
  apiKey: string,
  maxResults = 10
): Promise<YouTubeVideoMetadata[]> {
  try {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&order=date&type=video&key=${apiKey}`;
    const res = await fetch(searchUrl, { next: { revalidate: 1800 } });
    if (!res.ok) {
      console.warn(`YouTube Data API responded with status ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (!data.items || !Array.isArray(data.items)) return [];

    return data.items.map((item: any) => {
      const videoId = item.id?.videoId || "";
      const title = item.snippet?.title || "";
      const description = item.snippet?.description || "";
      const channelTitle = item.snippet?.channelTitle || "";
      const publishedAt = item.snippet?.publishedAt || new Date().toISOString();
      const thumbnails = item.snippet?.thumbnails;
      const thumbnailUrl =
        thumbnails?.maxres?.url ||
        thumbnails?.high?.url ||
        thumbnails?.medium?.url ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      return {
        videoId,
        title,
        description,
        thumbnailUrl,
        channelTitle,
        channelId,
        publishedAt,
        isShort: isLikelyShort(title, description),
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        embedUrl: getYouTubeEmbedUrl(videoId),
      };
    });
  } catch (err) {
    console.error("Error calling YouTube Data API:", err);
    return [];
  }
}

/**
 * Fetch channel videos using official YouTube Channel RSS Feed
 * Allows discovery without API quota consumption.
 */
export async function fetchFromYouTubeRss(channelId: string): Promise<YouTubeVideoMetadata[]> {
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const res = await fetch(rssUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NewsKrezReelsBot/1.0)" },
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      return [];
    }

    const xml = await res.text();
    const entries = xml.split("<entry>").slice(1);

    const results: YouTubeVideoMetadata[] = [];

    for (const entry of entries) {
      const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const titleMatch = entry.match(/<title>([^<]+)<\/title>/);
      const descMatch = entry.match(/<media:description>([\s\S]*?)<\/media:description>/);
      const authorMatch = entry.match(/<author>[\s\S]*?<name>([^<]+)<\/name>/);
      const thumbMatch = entry.match(/<media:thumbnail[^>]+url="([^"]+)"/);
      const publishedMatch = entry.match(/<published>([^<]+)<\/published>/);

      const videoId = videoIdMatch ? videoIdMatch[1].trim() : "";
      if (!videoId) continue;

      const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "News Reel";
      const description = descMatch ? descMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "";
      const channelTitle = authorMatch ? authorMatch[1].trim() : "News Publisher";
      const thumbnailUrl = thumbMatch
        ? thumbMatch[1]
        : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      const publishedAt = publishedMatch ? publishedMatch[1].trim() : new Date().toISOString();

      results.push({
        videoId,
        title,
        description,
        thumbnailUrl,
        channelTitle,
        channelId,
        publishedAt,
        isShort: isLikelyShort(title, description),
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        embedUrl: getYouTubeEmbedUrl(videoId),
      });
    }

    return results;
  } catch (err) {
    console.error(`Error fetching YouTube RSS for channel ${channelId}:`, err);
    return [];
  }
}
