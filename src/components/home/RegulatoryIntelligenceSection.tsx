import React from "react";
import Link from "next/link";
import { ArticleCard, ArticleCardData } from "@/components/news/ArticleCard";
import { FileCheck, ShieldCheck, ChevronRight, Scale, CheckSquare } from "lucide-react";

interface RegulatoryIntelligenceSectionProps {
  articles: ArticleCardData[];
}

export const RegulatoryIntelligenceSection: React.FC<RegulatoryIntelligenceSectionProps> = ({
  articles = [],
}) => {
  const complianceTags = [
    { name: "21 CFR Part 11", href: "/search?q=21+CFR+Part+11" },
    { name: "FDA QMSR Transition", href: "/search?q=QMSR" },
    { name: "ISO 13485:2016", href: "/search?q=ISO+13485" },
    { name: "EU MDR / IVDR", href: "/search?q=EU+MDR" },
    { name: "Computer Software Assurance (CSA)", href: "/search?q=CSA" },
    { name: "Data Integrity & ALCOA+", href: "/search?q=Data+Integrity" },
    { name: "CDSCO Medical Device Rules", href: "/search?q=CDSCO" },
    { name: "GMP Warning Letters", href: "/search?q=Warning+Letter" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-br from-navy-900 to-navy-950 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-navy-800">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-navy-800 mb-6 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brandTeal-600/20 text-brandTeal-400 border border-brandTeal-500/30">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-white">
                Regulatory Intelligence, Compliance & Quality Standards
              </h2>
              <p className="text-xs text-slate-300">
                In-depth analysis of GxP, FDA inspection observations, ISO harmonization, and global pharma/device regulations
              </p>
            </div>
          </div>

          <Link
            href="/category/regulatory-intelligence"
            className="text-xs font-bold text-brandTeal-400 hover:text-white flex items-center gap-1"
          >
            <span>Regulatory Knowledge Desk</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2">
            Standards & Topics:
          </span>
          {complianceTags.map((tag) => (
            <Link
              key={tag.name}
              href={tag.href}
              className="text-xs bg-navy-800/80 hover:bg-brandTeal-600 hover:text-white text-slate-300 px-3 py-1 rounded-full border border-navy-700 transition-colors"
            >
              {tag.name}
            </Link>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.slice(0, 3).map((art) => (
            <div
              key={art.id}
              className="bg-navy-900/90 rounded-xl p-5 border border-navy-700/80 hover:border-brandTeal-400 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-brandTeal-400 uppercase tracking-wider px-2 py-0.5 rounded bg-brandTeal-950/60 border border-brandTeal-800">
                  {art.categoryName || "Regulatory"}
                </span>

                <h3 className="font-serif font-bold text-base text-white group-hover:text-brandTeal-300 transition-colors line-clamp-2 leading-snug">
                  <Link href={`/article/${art.slug}`}>{art.title}</Link>
                </h3>

                {art.excerpt && (
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {art.excerpt}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-navy-800 flex items-center justify-between text-xs text-slate-400">
                <span>{art.readingTimeMinutes || 5} min read</span>
                <Link
                  href={`/article/${art.slug}`}
                  className="text-brandTeal-300 hover:text-white font-semibold inline-flex items-center gap-1"
                >
                  Analysis →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
