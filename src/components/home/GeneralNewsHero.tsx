import React from "react";
import { ArticleCard, ArticleCardData } from "@/components/news/ArticleCard";
import Link from "next/link";
import { Sparkles, Globe2, ArrowUpRight, Flame } from "lucide-react";

interface GeneralNewsHeroProps {
  leadArticle: ArticleCardData | null;
  secondaryArticles: ArticleCardData[];
}

export const GeneralNewsHero: React.FC<GeneralNewsHeroProps> = ({
  leadArticle,
  secondaryArticles = [],
}) => {
  if (!leadArticle && secondaryArticles.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 pt-4 pb-6">
      {/* Top Banner Indicator for General News Visual Priority */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-navy-900">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-navy-900 text-amber-400">
            <Globe2 className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-black text-2xl sm:text-3xl text-navy-950 tracking-tight">
                Top General News
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-alertRed-50 text-alertRed-600 border border-alertRed-200 text-xs font-black uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 fill-alertRed-600" />
                Live Headlines
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              National & global reporting, political developments, economy, and breaking updates.
            </p>
          </div>
        </div>

        <Link
          href="/category/general-news"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-brandTeal-600 hover:text-navy-900 transition-colors uppercase tracking-wider"
        >
          <span>Explore All 12 Desks</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Hero Story */}
        <div className="lg:col-span-8">
          {leadArticle && <ArticleCard article={leadArticle} variant="hero" />}
        </div>

        {/* Secondary General News Stories */}
        <div className="lg:col-span-4 flex flex-col gap-4 justify-between">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-black text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brandTeal-600" />
                Key General Highlights
              </span>
              <span className="text-[11px] text-brandTeal-700 font-extrabold uppercase px-2 py-0.5 rounded bg-brandTeal-50">
                Verified Wire
              </span>
            </div>

            <div className="divide-y divide-slate-100 space-y-3">
              {secondaryArticles.slice(0, 3).map((art) => (
                <div key={art.id} className="pt-3 first:pt-0">
                  <ArticleCard article={art} variant="compact" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Category Gateway Card */}
          <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-navy-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-black text-amber-400 tracking-wider">
                NewsKrez Fast Wire
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h4 className="text-sm font-bold text-white">
              Instant multi-category syndication across India, World, Politics & Economy.
            </h4>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["India", "World", "Politics", "Business", "Sports", "Science"].map((t) => (
                <Link
                  key={t}
                  href={`/category/${t.toLowerCase().replace(" ", "-")}-news`}
                  className="px-2 py-1 rounded-md bg-navy-800 hover:bg-brandTeal-600 text-[11px] font-bold text-slate-200 hover:text-white transition-colors"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
