"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArticleCard, ArticleCardData } from "@/components/news/ArticleCard";
import { Layers, ArrowRight, ExternalLink } from "lucide-react";

interface GeneralNewsTabsProps {
  articles: ArticleCardData[];
}

export const GeneralNewsTabs: React.FC<GeneralNewsTabsProps> = ({ articles }) => {
  const tabs = [
    { label: "All News", slug: "all" },
    { label: "India", slug: "india-news" },
    { label: "World", slug: "world-news" },
    { label: "Politics", slug: "politics" },
    { label: "Business", slug: "business-economy" },
    { label: "Sports", slug: "sports" },
    { label: "Entertainment", slug: "entertainment" },
    { label: "Science", slug: "science" },
  ];

  const [activeTab, setActiveTab] = useState("all");

  const filteredArticles = useMemo(() => {
    if (activeTab === "all") return articles.slice(0, 8);
    return articles
      .filter((a) => a.categorySlug === activeTab)
      .slice(0, 8);
  }, [articles, activeTab]);

  return (
    <section className="space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-navy-900">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-brandTeal-600" />
          <h3 className="font-serif font-black text-xl sm:text-2xl text-navy-950">
            Latest General News
          </h3>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.slug;
            return (
              <button
                key={tab.slug}
                onClick={() => setActiveTab(tab.slug)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-navy-900 text-white shadow-sm ring-2 ring-brandTeal-500"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-navy-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtered Articles Grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} variant="standard" />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500">
          <p className="font-semibold text-sm">
            No articles found in this category tab yet. Updates synchronizing...
          </p>
        </div>
      )}

      {/* View Full Category Link */}
      <div className="flex justify-end pt-2">
        <Link
          href={activeTab === "all" ? "/category/general-news" : `/category/${activeTab}`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brandTeal-600 hover:text-navy-900 transition-colors"
        >
          <span>View all in {tabs.find((t) => t.slug === activeTab)?.label}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};
