import React from "react";
import Link from "next/link";
import { ArticleCard, ArticleCardData } from "@/components/news/ArticleCard";
import { Cpu, ShieldCheck, ChevronRight, Binary, Sparkles } from "lucide-react";

interface TechAISectionProps {
  articles: ArticleCardData[];
}

export const TechAISection: React.FC<TechAISectionProps> = ({ articles = [] }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-brandTeal-600 mb-6 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 text-brandTeal-700">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-black text-navy-900">
              Technology, AI & Cybersecurity
            </h2>
            <p className="text-xs text-slate-500">
              Healthcare AI models, medical device cybersecurity, enterprise cloud, and generative drug discovery
            </p>
          </div>
        </div>
        <Link
          href="/category/technology"
          className="text-xs font-bold text-brandTeal-700 hover:text-brandTeal-800 flex items-center gap-1 group"
        >
          <span>All Technology News</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.slice(0, 3).map((art) => (
          <ArticleCard key={art.id} article={art} variant="standard" />
        ))}
      </div>
    </section>
  );
};
