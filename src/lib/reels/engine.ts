import { db, schema } from "@/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { fetchFromYouTubeApi, fetchFromYouTubeRss, YouTubeVideoMetadata } from "./youtube";

export interface DefaultSourceConfig {
  name: string;
  code: string;
  sourceType: "youtube_channel" | "youtube_playlist" | "video_rss";
  channelId: string;
  defaultCategorySlug: string;
  requiresEditorialApproval: boolean;
  dailyPublishLimit: number;
}

export const DEFAULT_REEL_SOURCES: DefaultSourceConfig[] = [
  {
    name: "BBC News Shorts",
    code: "bbc-news-shorts",
    sourceType: "youtube_channel",
    channelId: "UC16niRr50-MSBwiO3YDb3RA", // Official BBC News
    defaultCategorySlug: "world-news",
    requiresEditorialApproval: false,
    dailyPublishLimit: 8,
  },
  {
    name: "Reuters World Intel",
    code: "reuters-shorts",
    sourceType: "youtube_channel",
    channelId: "UChqUTb7kYRX8-EiaN3XFrSQ", // Official Reuters
    defaultCategorySlug: "world-news",
    requiresEditorialApproval: false,
    dailyPublishLimit: 8,
  },
  {
    name: "DD News India",
    code: "dd-news-india",
    sourceType: "youtube_channel",
    channelId: "UC5_6mYvC81Vv3n9s_0G1kcw", // Official Doordarshan News
    defaultCategorySlug: "india-news",
    requiresEditorialApproval: false,
    dailyPublishLimit: 8,
  },
  {
    name: "Bloomberg Technology",
    code: "bloomberg-tech",
    sourceType: "youtube_channel",
    channelId: "UCrM7B7SL_g1ed356KcCB61g", // Official Bloomberg Technology
    defaultCategorySlug: "technology",
    requiresEditorialApproval: false,
    dailyPublishLimit: 8,
  },
  {
    name: "CNBC Business & Economy",
    code: "cnbc-business",
    sourceType: "youtube_channel",
    channelId: "UCvJJ_dzjViJCoLf5uKUTwoA", // Official CNBC
    defaultCategorySlug: "business-economy",
    requiresEditorialApproval: false,
    dailyPublishLimit: 8,
  },
  {
    name: "World Health Organization (WHO)",
    code: "who-official-video",
    sourceType: "youtube_channel",
    channelId: "UC07-dOwgza1IguKA86jqxNA", // Official WHO
    defaultCategorySlug: "who-healthcare",
    requiresEditorialApproval: true, // Medical review required
    dailyPublishLimit: 5,
  },
  {
    name: "U.S. FDA Official",
    code: "fda-official-video",
    sourceType: "youtube_channel",
    channelId: "UCpPqB_Z5K3_jXzZ6C9cM0eA", // Official US FDA
    defaultCategorySlug: "fda-news",
    requiresEditorialApproval: true, // Regulatory review required
    dailyPublishLimit: 5,
  },
];

/**
 * Ensure default verified video sources exist in database
 */
export async function seedReelSourcesIfEmpty(): Promise<void> {
  const existing = await db.query.reelSources.findMany();
  if (existing.length === 0) {
    for (const src of DEFAULT_REEL_SOURCES) {
      await db.insert(schema.reelSources).values({
        name: src.name,
        code: src.code,
        sourceType: src.sourceType,
        channelId: src.channelId,
        defaultCategorySlug: src.defaultCategorySlug,
        requiresEditorialApproval: src.requiresEditorialApproval,
        dailyPublishLimit: src.dailyPublishLimit,
        isEnabled: true,
      });
    }
  }
}

/**
 * Helper to slugify a title safely
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 180);
}

/**
 * Run automatic video discovery and ingestion across all active reel sources
 */
export async function runReelsIngestion(specificSourceId?: number) {
  await seedReelSourcesIfEmpty();

  const allSources = await db.query.reelSources.findMany({
    where: specificSourceId ? eq(schema.reelSources.id, specificSourceId) : eq(schema.reelSources.isEnabled, true),
  });

  const categories = await db.query.categories.findMany();
  const catMap = new Map<string, { id: number; name: string }>();
  for (const c of categories) {
    catMap.set(c.slug, { id: c.id, name: c.name });
  }

  const youtubeApiKey = process.env.YOUTUBE_API_KEY || "";

  let totalFound = 0;
  let totalImported = 0;
  let totalSkipped = 0;
  const errors: string[] = [];

  for (const src of allSources) {
    const dailyLimit = src.dailyPublishLimit ?? 10;
    if (src.publishedToday >= dailyLimit) {
      continue;
    }

    let videos: YouTubeVideoMetadata[] = [];

    try {
      if (src.channelId) {
        if (youtubeApiKey) {
          videos = await fetchFromYouTubeApi(src.channelId, youtubeApiKey, 10);
        }
        // Fallback to RSS if no key or API returned empty
        if (videos.length === 0) {
          videos = await fetchFromYouTubeRss(src.channelId);
        }
      }
    } catch (fetchErr: any) {
      const msg = `Failed to fetch from source ${src.name}: ${fetchErr.message || fetchErr}`;
      errors.push(msg);
      await db
        .update(schema.reelSources)
        .set({
          lastFetchedAt: new Date(),
          lastErrorMessage: msg,
        })
        .where(eq(schema.reelSources.id, src.id));

      await db.insert(schema.reelImportLogs).values({
        sourceId: src.id,
        sourceName: src.name,
        status: "failed",
        reelsFound: 0,
        reelsImported: 0,
        reelsSkipped: 0,
        errorMessage: msg,
      });
      continue;
    }

    let sourceImported = 0;
    let sourceSkipped = 0;

    for (const vid of videos) {
      totalFound++;

      // Check if already in database by externalId
      const existing = await db.query.reels.findFirst({
        where: eq(schema.reels.externalId, vid.videoId),
      });

      if (existing) {
        sourceSkipped++;
        totalSkipped++;
        continue;
      }

      // Check if daily limit reached during loop
      if (src.publishedToday + sourceImported >= dailyLimit) {
        sourceSkipped++;
        totalSkipped++;
        continue;
      }

      const categorySlug = src.defaultCategorySlug || "general-news";
      const categoryInfo = catMap.get(categorySlug) || {
        id: 1,
        name: "General News",
      };

      const baseSlug = slugify(vid.title) || `reel-${vid.videoId}`;
      const uniqueSlug = `${baseSlug}-${vid.videoId.slice(0, 6)}`;

      // Compliance: FDA, Healthcare, or sources requiring approval are put in 'Pending Review'
      const isHealthOrFda =
        categorySlug === "fda-news" ||
        categorySlug === "who-healthcare" ||
        categorySlug === "medical-devices" ||
        categorySlug === "pharmaceutical" ||
        categorySlug === "regulatory-intelligence";

      const publicationStatus = src.requiresEditorialApproval || isHealthOrFda ? "Pending Review" : "Published";

      try {
        await db.insert(schema.reels).values({
          title: vid.title.slice(0, 250),
          slug: uniqueSlug,
          description: vid.description.slice(0, 1000),
          videoUrl: vid.videoUrl,
          videoType: "youtube",
          externalId: vid.videoId,
          thumbnailUrl: vid.thumbnailUrl,
          durationSeconds: 45,
          aspectRatio: "9:16",
          sourceId: src.id,
          sourceName: src.name,
          sourceUrl: vid.videoUrl,
          channelTitle: vid.channelTitle,
          primaryCategoryId: categoryInfo.id,
          categorySlug,
          categoryName: categoryInfo.name,
          status: publicationStatus,
          rightsStatus: "Authorized Embed",
          isFeatured: false,
          viewsCount: 0,
          likesCount: 0,
          sharesCount: 0,
          metadata: JSON.stringify({
            embedUrl: vid.embedUrl,
            channelId: vid.channelId,
            publishedAt: vid.publishedAt,
            isShort: vid.isShort,
          }),
          publishedAt: publicationStatus === "Published" ? new Date(vid.publishedAt) : null,
        });

        sourceImported++;
        totalImported++;
      } catch (insertErr: any) {
        console.error(`Error saving reel ${vid.videoId}:`, insertErr);
        sourceSkipped++;
        totalSkipped++;
      }
    }

    // Update source metrics
    await db
      .update(schema.reelSources)
      .set({
        lastFetchedAt: new Date(),
        lastSuccessAt: new Date(),
        lastErrorMessage: null,
        publishedToday: src.publishedToday + sourceImported,
        totalReelsImported: src.totalReelsImported + sourceImported,
      })
      .where(eq(schema.reelSources.id, src.id));

    await db.insert(schema.reelImportLogs).values({
      sourceId: src.id,
      sourceName: src.name,
      status: "success",
      reelsFound: videos.length,
      reelsImported: sourceImported,
      reelsSkipped: sourceSkipped,
    });
  }

  return {
    success: true,
    sourcesProcessed: allSources.length,
    reelsFound: totalFound,
    reelsImported: totalImported,
    reelsSkipped: totalSkipped,
    errors,
  };
}
