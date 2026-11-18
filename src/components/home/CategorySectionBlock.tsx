import React from "react";
import Link from "next/link";
import { ArticleCard, ArticleCardData } from "@/components/news/ArticleCard";
import { ArrowRight, LucideIcon } from "lucide-react";

interface CategorySectionBlockProps {
  title: string;
  categorySlug: string;
  articles: ArticleCardData[];
  viewAllHref?: string;
  tagline?: string;
  icon?: LucideIcon;
  badge?: string;
}

export const CategorySectionBlock: React.FC<CategorySectionBlockProps> = ({
  title,
  categorySlug,
  articles,
  viewAllHref,
  tagline,
  icon: Icon,
  badge,
}) => {
  if (!articles || articles.length === 0) return null;

  const targetHref = viewAllHref || `/category/${categorySlug}`;

  // First article can be featured prominently, remaining 2-3 as standard cards
  const lead = articles[0];
  const rest = articles.slice(1, 4);

  return (
    <section className="space-y-4 pt-4 border-t border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b-2 border-navy-900">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-brandTeal-600 shrink-0" />}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-black text-xl sm:text-2xl text-navy-950">
                {title}
              </h3>
              {badge && (
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-brandTeal-50 text-brandTeal-700 border border-brandTeal-200">
                  {badge}
                </span>
              )}
            </div>
            {tagline && (
              <p className="text-xs text-slate-500 font-medium">{tagline}</p>
            )}
          </div>
        </div>

        <Link
          href={targetHref}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-brandTeal-600 hover:text-navy-900 transition-colors uppercase tracking-wider"
        >
          <span>More in {title.split(" ")[0]}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid: 1 prominent lead card + grid of secondary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2">
          {lead && <ArticleCard article={lead} variant="standard" />}
        </div>
        <div className="space-y-4 flex flex-col justify-between">
          {rest.map((art) => (
            <div key={art.id} className="pb-3 last:pb-0 border-b last:border-0 border-slate-100">
              <ArticleCard article={art} variant="compact" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
