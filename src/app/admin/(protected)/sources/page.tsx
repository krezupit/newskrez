import React from "react";
import { db, schema } from "@/db";
import { desc } from "drizzle-orm";
import { SourcesTableClient } from "./SourcesTableClient";

export const dynamic = "force-dynamic";

export default async function AdminSourcesPage() {
  const sources = await db.query.sources.findMany({
    orderBy: [schema.sources.id],
  });

  const logs = await db.query.fetchLogs.findMany({
    orderBy: [desc(schema.fetchLogs.fetchedAt)],
    limit: 20,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-navy-900">
            API Source Connectors & Ingestion Scheduler
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated connectors for openFDA, WHO feeds, CDC public health dockets, and RSS streams.
          </p>
        </div>
      </div>

      <SourcesTableClient initialSources={sources} initialLogs={logs} />
    </div>
  );
}
