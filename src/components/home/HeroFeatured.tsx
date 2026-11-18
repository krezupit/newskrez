import React from "react";
import { ArticleCard, ArticleCardData } from "@/components/news/ArticleCard";
import Link from "next/link";
import { TrendingUp, Sparkles, AlertTriangle } from "lucide-react";

interface HeroFeaturedProps {
  leadArticle: ArticleCardData | null;
  secondaryArticles: ArticleCardData[];
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({
  leadArticle,
  secondaryArticles = [],
}) => {
  if (!leadArticle && secondaryArticles.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Lead Story */}
        <div className="lg:col-span-8">
          {leadArticle && <ArticleCard article={leadArticle} variant="hero" />}
        </div>

        {/* Secondary Featured Side Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4 justify-between">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <span className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brandTeal-600" />
                Featured Intelligence
              </span>
              <span className="text-[10px] text-brandTeal-600 font-semibold uppercase">
                Editor Picked
              </span>
            </div>

            <div className="space-y-4">
              {secondaryArticles.slice(0, 3).map((art) => (
                <ArticleCard key={art.id} article={art} variant="compact" />
              ))}
            </div>
          </div>

          {/* Quick Regulatory Quick-Access Banner */}
          <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white p-4 rounded-xl shadow-md border border-navy-700 space-y-2">
            <div className="flex items-center gap-2 text-alertRed-400 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              <span>Real-Time Recall Sentinel</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Automated ingestion tracking FDA Class I recalls, medical device 510(k) clearances, and WHO pathogen alerts.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <Link
                href="/medical-devices"
                className="text-xs font-bold text-brandTeal-300 hover:text-white underline"
              >
                Explore MedTech Intelligence Hub →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
