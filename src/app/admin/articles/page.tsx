import React from "react";
import { db, schema } from "@/db";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { ArticlesTableClient } from "./ArticlesTableClient";

export const dynamic = "force-dynamic";

interface AdminArticlesPageProps {
  searchParams: {
    status?: string;
    cat?: string;
  };
}

export default async function AdminArticlesPage({ searchParams }: AdminArticlesPageProps) {
  const statusFilter = searchParams.status || "all";

  const categories = await db.query.categories.findMany({
    orderBy: [schema.categories.name],
  });
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  const sources = await db.query.sources.findMany();
  const sourceMap = new Map(sources.map((s) => [s.id, s.name]));

  const articlesRaw = await db.query.articles.findMany({
    where: statusFilter !== "all" ? eq(schema.articles.status, statusFilter) : undefined,
    orderBy: [desc(schema.articles.createdAt)],
    limit: 60,
  });

  const articles = articlesRaw.map((a) => ({
    ...a,
    primaryCategory: { name: catMap.get(a.primaryCategoryId) || "General" },
    source: a.sourceId ? { name: sourceMap.get(a.sourceId) } : null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-navy-900">
            News Article Management & Editorial Workflow
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review, edit, publish, or archive news stories across all desks.
          </p>
        </div>

        <Link
          href="/admin/articles/create"
          className="px-4 py-2.5 bg-brandTeal-600 hover:bg-brandTeal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm shrink-0"
        >
          + Draft New Article
        </Link>
      </div>

      <ArticlesTableClient initialArticles={articles} categories={categories} activeStatus={statusFilter} />
    </div>
  );
}
