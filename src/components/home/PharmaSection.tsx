import React from "react";
import Link from "next/link";
import { ArticleCard, ArticleCardData } from "@/components/news/ArticleCard";
import { Pill, ChevronRight, FlaskConical } from "lucide-react";

interface PharmaSectionProps {
  articles: ArticleCardData[];
}

export const PharmaSection: React.FC<PharmaSectionProps> = ({ articles = [] }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-navy-900 mb-6 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-navy-100 text-navy-900">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-black text-navy-900">
              Pharmaceutical & Biotechnology Intelligence
            </h2>
            <p className="text-xs text-slate-500">
              Drug approvals, oncology breakthroughs, API manufacturing, clinical trials, and drug safety
            </p>
          </div>
        </div>
        <Link
          href="/category/pharmaceutical"
          className="text-xs font-bold text-navy-900 hover:text-brandTeal-600 flex items-center gap-1 group"
        >
          <span>All Pharma News</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.slice(0, 3).map((art) => (
          <ArticleCard key={art.id} article={art} variant="standard" />
        ))}
      </div>
    </section>
  );
};
