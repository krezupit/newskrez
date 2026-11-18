import React from "react";
import { db, schema } from "@/db";
import { ArticleFormClient } from "./ArticleFormClient";

export const dynamic = "force-dynamic";

export default async function CreateArticlePage() {
  const categories = await db.query.categories.findMany({
    orderBy: [schema.categories.name],
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-serif font-black text-navy-900">
          Compose & Publish Intelligence Article
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Authoritative editorial news composition with SEO metadata, category routing, and instant publication options.
        </p>
      </div>

      <ArticleFormClient categories={categories} />
    </div>
  );
}
