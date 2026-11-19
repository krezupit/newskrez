import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { desc, sql, eq } from "drizzle-orm";
import { ReelsAdminClient } from "./ReelsAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminReelsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }

  // 1. Fetch initial reels
  const reels = await db.query.reels.findMany({
    orderBy: [desc(schema.reels.id)],
    limit: 60,
  });

  // 2. Fetch video sources
  const sources = await db.query.reelSources.findMany({
    orderBy: [schema.reelSources.name],
  });

  // 3. Fetch import logs
  const logs = await db.query.reelImportLogs.findMany({
    orderBy: [desc(schema.reelImportLogs.id)],
    limit: 20,
  });

  // 4. Fetch published articles for AI Reel generation studio
  const publishedArticles = await db.query.articles.findMany({
    where: eq(schema.articles.status, "Published"),
    orderBy: [desc(schema.articles.publishedAt)],
    limit: 30,
  });

  // 5. Aggregate metrics
  const [totalCountRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.reels);
  const [publishedCountRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.reels)
    .where(eq(schema.reels.status, "Published"));
  const [pendingCountRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.reels)
    .where(eq(schema.reels.status, "Pending Review"));
  const [viewsCountRow] = await db
    .select({ sum: sql<number>`COALESCE(sum(${schema.reels.viewsCount}), 0)` })
    .from(schema.reels);

  const metrics = {
    total: Number(totalCountRow?.count || 0),
    published: Number(publishedCountRow?.count || 0),
    pending: Number(pendingCountRow?.count || 0),
    totalViews: Number(viewsCountRow?.sum || 0),
    activeSources: sources.filter((s) => s.isEnabled).length,
  };

  return (
    <ReelsAdminClient
      initialReels={reels as any}
      initialSources={sources as any}
      initialLogs={logs as any}
      articles={publishedArticles as any}
      metrics={metrics}
    />
  );
}
