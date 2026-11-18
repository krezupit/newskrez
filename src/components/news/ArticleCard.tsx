import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Clock, Eye } from "lucide-react";

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
      <div className="relative group overflow-hidden rounded-2xl bg-navy-900 shadow-xl h-full min-h-[420px] lg:min-h-[520px] flex flex-col justify-end">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{
            backgroundImage: `url(${article.featuredImage || defaultImage})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-900/70 to-transparent" />

        <div className="relative z-10 p-6 md:p-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            {article.isBreaking && (
              <span className="bg-alertRed-600 text-white text-xs uppercase font-black tracking-wider px-2.5 py-1 rounded shadow">
                Breaking Alert
              </span>
            )}
            {article.categoryName && (
              <Link
                href={`/category/${article.categorySlug || ""}`}
                className="bg-brandTeal-600/95 hover:bg-brandTeal-500 text-white text-xs uppercase font-extrabold tracking-wider px-3 py-1 rounded backdrop-blur-sm transition-colors shadow"
              >
                {article.categoryName}
              </Link>
            )}
            <span className="text-slate-200 text-xs sm:text-sm flex items-center gap-1.5 font-semibold">
              <Clock className="w-4 h-4 text-brandTeal-300" />
              {publishedDate}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-white leading-tight group-hover:text-brandTeal-300 transition-colors">
            <Link href={`/article/${article.slug}`}>{article.title}</Link>
          </h1>

          {article.excerpt && (
            <p className="text-sm sm:text-base text-slate-200 line-clamp-3 max-w-3xl leading-relaxed font-normal">
              {article.excerpt}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-300 pt-3 border-t border-slate-700/60 font-medium">
            <span>{article.readingTimeMinutes || 4} min read</span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-brandTeal-400" />
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
      <article className="flex flex-col sm:flex-row gap-5 p-5 rounded-2xl bg-white border border-slate-200 hover:border-brandTeal-500 hover:shadow-md transition-all group">
        <Link
          href={`/article/${article.slug}`}
          className="relative w-full sm:w-56 h-40 shrink-0 rounded-xl overflow-hidden bg-slate-100 block"
        >
          <img
            src={article.featuredImage || defaultImage}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {article.isBreaking && (
            <span className="absolute top-2.5 left-2.5 bg-alertRed-600 text-white text-xs uppercase font-black px-2 py-0.5 rounded shadow">
              Alert
            </span>
          )}
        </Link>

        <div className="flex flex-col justify-between flex-1 space-y-2.5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {article.categoryName && (
                <Link
                  href={`/category/${article.categorySlug || ""}`}
                  className="text-xs sm:text-sm font-black text-brandTeal-600 hover:text-brandTeal-700 uppercase tracking-wider"
                >
                  {article.categoryName}
                </Link>
              )}
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 text-xs sm:text-sm font-medium">{publishedDate}</span>
            </div>

            <h3 className="font-serif font-black text-base sm:text-lg text-navy-900 leading-snug group-hover:text-brandTeal-600 transition-colors line-clamp-2">
              <Link href={`/article/${article.slug}`}>{article.title}</Link>
            </h3>

            {article.excerpt && (
              <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                {article.excerpt}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 pt-3 border-t border-slate-100 font-medium">
            <span>{article.readingTimeMinutes || 3} min read</span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-brandTeal-600" />
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
      <article className="flex items-start gap-3.5 py-3.5 border-b border-slate-100 last:border-b-0 group">
        <Link
          href={`/article/${article.slug}`}
          className="relative w-24 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 block"
        >
          <img
            src={article.featuredImage || defaultImage}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
        <div className="flex-1 space-y-1.5">
          {article.categoryName && (
            <span className="text-xs font-black uppercase tracking-wider text-brandTeal-600 block">
              {article.categoryName}
            </span>
          )}
          <h4 className="font-serif font-bold text-sm text-navy-900 leading-snug line-clamp-2 group-hover:text-brandTeal-600 transition-colors">
            <Link href={`/article/${article.slug}`}>{article.title}</Link>
          </h4>
          <span className="text-xs text-slate-400 block font-medium">{publishedDate}</span>
        </div>
      </article>
    );
  }

  // 4. STANDARD CARD (Default Grid)
  return (
    <article className="flex flex-col rounded-2xl bg-white border border-slate-200 overflow-hidden hover:border-brandTeal-500 hover:shadow-lg transition-all group h-full">
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
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {article.isBreaking && (
            <span className="bg-alertRed-600 text-white text-xs uppercase font-black tracking-wider px-2.5 py-0.5 rounded shadow">
              Alert
            </span>
          )}
          {article.categoryName && (
            <span className="bg-navy-900/90 backdrop-blur-sm text-brandTeal-200 text-xs uppercase font-black tracking-wider px-2.5 py-0.5 rounded shadow">
              {article.categoryName}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-col justify-between flex-1 p-5 space-y-3.5">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs sm:text-sm text-slate-400 font-medium">
            <span>{publishedDate}</span>
            <span>{article.readingTimeMinutes || 3} min read</span>
          </div>

          <h3 className="font-serif font-black text-lg text-navy-900 leading-snug group-hover:text-brandTeal-600 transition-colors line-clamp-2">
            <Link href={`/article/${article.slug}`}>{article.title}</Link>
          </h3>

          {article.excerpt && (
            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500 pt-3.5 border-t border-slate-100 mt-auto font-semibold">
          <span className="text-brandTeal-600 group-hover:underline inline-flex items-center gap-1">
            Read Full Intelligence →
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Eye className="w-4 h-4 text-brandTeal-500" />
            {article.viewsCount || 0}
          </span>
        </div>
      </div>
    </article>
  );
};
