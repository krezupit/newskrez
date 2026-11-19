import React from "react";
import { db, schema } from "@/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { ReelsFeed } from "@/components/reels/ReelsFeed";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News Reels | Vertical Video Briefings & Regulatory Shorts | NewsKrez",
  description:
    "Watch verified 9:16 vertical video shorts, breaking headlines, FDA alerts, and AI news reels curated from global authorized publishers.",
  openGraph: {
    title: "NewsKrez Reels - Vertical News & Regulatory Intel",
    description: "Real-time 9:16 vertical video feed for global news, pharma, medtech and policy.",
    url: "https://newskrez.com/reels",
    type: "website",
  },
};

interface ReelsPageProps {
  searchParams: {
    cat?: string;
    id?: string;
  };
}

export default async function ReelsPage({ searchParams }: ReelsPageProps) {
  const categorySlug = searchParams.cat || "all";
  const targetId = searchParams.id ? parseInt(searchParams.id, 10) : null;

  const whereConditions = [eq(schema.reels.status, "Published")];
  if (categorySlug !== "all") {
    whereConditions.push(eq(schema.reels.categorySlug, categorySlug));
  }

  let reels = await db.query.reels.findMany({
    where: and(...whereConditions),
    orderBy: [desc(schema.reels.publishedAt), desc(schema.reels.id)],
    limit: 25,
  });

  // If a specific reel ID was requested in query params, place it first
  if (targetId && !isNaN(targetId)) {
    const specificReel = await db.query.reels.findFirst({
      where: eq(schema.reels.id, targetId),
    });
    if (specificReel) {
      reels = [specificReel, ...reels.filter((r) => r.id !== specificReel.id)];
    }
  }

  // Attach related articles info
  const articleIds = reels
    .map((r) => r.relatedArticleId)
    .filter((id): id is number => typeof id === "number" && id > 0);

  const articleMap = new Map<number, { slug: string; title: string }>();
  if (articleIds.length > 0) {
    const relatedArts = await db.query.articles.findMany({
      where: sql`${schema.articles.id} IN (${sql.join(articleIds.map((id) => sql`${id}`), sql`, `)})`,
    });
    for (const a of relatedArts) {
      articleMap.set(a.id, { slug: a.slug, title: a.title });
    }
  }

  const enrichedReels = reels.map((r) => {
    const art = r.relatedArticleId ? articleMap.get(r.relatedArticleId) : null;
    let parsedMetadata: any = null;
    if (r.metadata) {
      try {
        parsedMetadata = typeof r.metadata === "string" ? JSON.parse(r.metadata) : r.metadata;
      } catch (_) {}
    }

    return {
      ...r,
      metadata: parsedMetadata,
      relatedArticleSlug: art?.slug || null,
      relatedArticleTitle: art?.title || null,
    };
  });

  return (
    <main className="w-full h-full bg-navy-950 overflow-hidden">
      <ReelsFeed initialReels={enrichedReels as any} initialCategory={categorySlug} />
    </main>
  );
}
