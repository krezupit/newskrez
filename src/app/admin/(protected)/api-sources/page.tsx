import React from "react";
import { Metadata } from "next";
import { ApiSourcesClient } from "./ApiSourcesClient";
import { getProvidersStatusList } from "@/lib/news-providers";
import { db, schema } from "@/db";
import { desc } from "drizzle-orm";

export const metadata: Metadata = {
  title: "API News Providers | NewsKrez Admin",
  description: "Manage GNews, NewsAPI, Currents, Mediastack, and NewsData connectors, quotas, and automated ingestion.",
};

export const dynamic = "force-dynamic";

export default async function ApiSourcesPage() {
  const initialProviders = await getProvidersStatusList();

  const initialLogs = await db.query.providerFetchLogs.findMany({
    orderBy: (l, { desc }) => [desc(l.fetchedAt)],
    limit: 20,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-navy-950">
          API News Providers
        </h1>
        <p className="text-slate-600 mt-1 text-sm sm:text-base">
          Unified control panel for multi-source wire ingestion across GNews, NewsAPI, Currents, Mediastack, and NewsData.io.
        </p>
      </div>

      <ApiSourcesClient
        initialProviders={initialProviders}
        initialLogs={initialLogs.map((log) => ({
          ...log,
          fetchedAt: log.fetchedAt.toISOString(),
        }))}
      />
    </div>
  );
}
