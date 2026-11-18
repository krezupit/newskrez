import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Clock, Eye, AlertCircle, Bookmark } from "lucide-react";

export interface ArticleCardData {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  categoryName?: string;
  categorySlug?: string;
  publishedAt?: Date | string | null;
  readingTimeMinutes?: number;
  viewsCount?: number;
  isBreaking?: boolean;
  isFeatured?: boolean;
  isEditorPick?: boolean;
}

interface ArticleCardProps {
  article: ArticleCardData;
  variant?: "standard" | "horizontal" | "compact" | "hero";
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  variant = "standard",
}) => {
  const publishedDate = article.publishedAt
    ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
    : "Recently";

  const defaultImage =
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80";

  // 1. HERO VARIANT
  if (variant === "hero") {
    return (
      <div className="relative group overflow-hidden rounded-xl bg-navy-900 shadow-xl h-full min-h-[380px] lg:min-h-[480px] flex flex-col justify-end">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{
            backgroundImage: `url(${article.featuredImage || defaultImage})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-900/60 to-transparent" />

        <div className="relative z-10 p-6 md:p-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {article.isBreaking && (
              <span className="bg-alertRed-600 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow">
                Breaking Alert
              </span>
            )}
            {article.categoryName && (
              <Link
                href={`/category/${article.categorySlug || ""}`}
                className="bg-brandTeal-600/90 hover:bg-brandTeal-500 text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded backdrop-blur-sm transition-colors"
              >
                {article.categoryName}
              </Link>
            )}
            <span className="text-slate-300 text-xs flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5" />
              {publishedDate}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black text-white leading-tight group-hover:text-brandTeal-300 transition-colors">
            <Link href={`/article/${article.slug}`}>{article.title}</Link>
          </h1>

          {article.excerpt && (
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 max-w-3xl leading-relaxed">
              {article.excerpt}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-700/50">
            <span>{article.readingTimeMinutes || 4} min read</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {article.viewsCount || 100} views
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. HORIZONTAL VARIANT (List style)
  if (variant === "horizontal") {
    return (
      <article className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:border-brandTeal-500/50 hover:shadow-md transition-all group">
        <Link
          href={`/article/${article.slug}`}
          className="relative w-full sm:w-48 h-36 shrink-0 rounded-lg overflow-hidden bg-slate-100"
        >
          <img
            src={article.featuredImage || defaultImage}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {article.isBreaking && (
            <span className="absolute top-2 left-2 bg-alertRed-600 text-white text-[9px] uppercase font-bold px-1.5 py-0.5 rounded shadow">
              Alert
            </span>
          )}
        </Link>

        <div className="flex flex-col justify-between flex-1 space-y-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              {article.categoryName && (
                <Link
                  href={`/category/${article.categorySlug || ""}`}
                  className="text-[11px] font-bold text-brandTeal-600 hover:text-brandTeal-700 uppercase tracking-wider"
                >
                  {article.categoryName}
                </Link>
              )}
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-slate-500 text-xs">{publishedDate}</span>
            </div>

            <h3 className="font-serif font-bold text-base sm:text-lg text-navy-900 leading-snug group-hover:text-brandTeal-600 transition-colors line-clamp-2">
              <Link href={`/article/${article.slug}`}>{article.title}</Link>
            </h3>

            {article.excerpt && (
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {article.excerpt}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
            <span>{article.readingTimeMinutes || 3} min read</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {article.viewsCount || 0}
            </span>
          </div>
        </div>
      </article>
    );
  }

  // 3. COMPACT VARIANT (Sidebar & mini-lists)
  if (variant === "compact") {
    return (
      <article className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-b-0 group">
        <Link
          href={`/article/${article.slug}`}
          className="relative w-20 h-16 shrink-0 rounded-md overflow-hidden bg-slate-100"
        >
          <img
            src={article.featuredImage || defaultImage}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
        <div className="flex-1 space-y-1">
          {article.categoryName && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-brandTeal-600">
              {article.categoryName}
            </span>
          )}
          <h4 className="font-serif font-semibold text-xs sm:text-sm text-navy-900 leading-snug line-clamp-2 group-hover:text-brandTeal-600 transition-colors">
            <Link href={`/article/${article.slug}`}>{article.title}</Link>
          </h4>
          <span className="text-[11px] text-slate-400 block">{publishedDate}</span>
        </div>
      </article>
    );
  }

  // 4. STANDARD CARD (Default Grid)
  return (
    <article className="flex flex-col rounded-xl bg-white border border-slate-200 overflow-hidden hover:border-brandTeal-500/50 hover:shadow-lg transition-all group h-full">
      <Link
        href={`/article/${article.slug}`}
        className="relative w-full aspect-video overflow-hidden bg-slate-100 block"
      >
        <img
          src={article.featuredImage || defaultImage}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          {article.isBreaking && (
            <span className="bg-alertRed-600 text-white text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow">
              Alert
            </span>
          )}
          {article.categoryName && (
            <span className="bg-navy-900/85 backdrop-blur-sm text-brandTeal-300 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow">
              {article.categoryName}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-col justify-between flex-1 p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{publishedDate}</span>
            <span>{article.readingTimeMinutes || 3} min read</span>
          </div>

          <h3 className="font-serif font-bold text-base text-navy-900 leading-snug group-hover:text-brandTeal-600 transition-colors line-clamp-2">
            <Link href={`/article/${article.slug}`}>{article.title}</Link>
          </h3>

          {article.excerpt && (
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 mt-auto">
          <span className="text-brandTeal-600 font-semibold group-hover:underline inline-flex items-center gap-1">
            Read Full Intelligence →
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {article.viewsCount || 0}
          </span>
        </div>
      </div>
    </article>
  );
};
