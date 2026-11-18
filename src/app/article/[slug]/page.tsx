import React from "react";
import { db, schema } from "@/db";
import { eq, and, desc, ne } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/auth";
import { ArticleCard } from "@/components/news/ArticleCard";
import { AdPlacement } from "@/components/home/AdPlacement";
import Link from "next/link";
import { format } from "date-fns";
import type { Metadata } from "next";
import {
  Clock,
  Eye,
  Calendar,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  User,
} from "lucide-react";

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const article = await db.query.articles.findFirst({
    where: eq(schema.articles.slug, params.slug),
  });

  if (!article) {
    return {
      title: "Article Not Found | NewsKrez",
    };
  }

  const title = article.seoTitle || `${article.title} | NewsKrez`;
  const description =
    article.metaDescription || article.excerpt || "NewsKrez Intelligence Report.";
  const url = `https://newskrez.com/article/${article.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: article.canonicalUrl || url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: article.publishedAt
        ? new Date(article.publishedAt).toISOString()
        : undefined,
      images: [
        {
          url:
            article.featuredImage ||
            "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&auto=format&fit=crop&q=80",
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        article.featuredImage ||
          "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&auto=format&fit=crop&q=80",
      ],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const currentUser = await getCurrentUser();

  const article = await db.query.articles.findFirst({
    where: eq(schema.articles.slug, params.slug),
  });

  if (!article) {
    notFound();
  }

  // Related entities lookup (safe standard SQL without lateral joins)
  const category = await db.query.categories.findFirst({
    where: eq(schema.categories.id, article.primaryCategoryId),
  });

  const author = article.authorId
    ? await db.query.users.findFirst({
        where: eq(schema.users.id, article.authorId),
      })
    : null;

  const source = article.sourceId
    ? await db.query.sources.findFirst({
        where: eq(schema.sources.id, article.sourceId),
      })
    : null;

  // Increment views count asynchronously
  try {
    await db
      .update(schema.articles)
      .set({ viewsCount: article.viewsCount + 1 })
      .where(eq(schema.articles.id, article.id));
  } catch (e) {
    // ignore counter error in render
  }

  // Fetch nav categories
  const navCategories = await db.query.categories.findMany({
    where: and(eq(schema.categories.isActive, true), eq(schema.categories.isNav, true)),
    orderBy: [schema.categories.displayOrder],
    limit: 10,
  });

  // Fetch related articles in same category
  const relatedArticlesRaw = await db.query.articles.findMany({
    where: and(
      eq(schema.articles.status, "Published"),
      eq(schema.articles.primaryCategoryId, article.primaryCategoryId),
      ne(schema.articles.id, article.id)
    ),
    orderBy: [desc(schema.articles.publishedAt)],
    limit: 4,
  });

  const relatedArticles = relatedArticlesRaw.map((r) => ({
    ...r,
    categoryName: category?.name,
    categorySlug: category?.slug,
  }));

  const publishedDateStr = article.publishedAt
    ? format(new Date(article.publishedAt), "MMMM dd, yyyy • h:mm a 'UTC'")
    : "Recently Published";

  // NewsArticle JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: [
      article.featuredImage ||
        "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&auto=format&fit=crop&q=80",
    ],
    datePublished: article.publishedAt
      ? new Date(article.publishedAt).toISOString()
      : new Date().toISOString(),
    dateModified: article.updatedAt
      ? new Date(article.updatedAt).toISOString()
      : new Date().toISOString(),
    author: {
      "@type": "Organization",
      name: author?.name || "NewsKrez Editorial Desk",
      url: "https://newskrez.com",
    },
    publisher: {
      "@type": "Organization",
      name: "NewsKrez",
      logo: {
        "@type": "ImageObject",
        url: "https://newskrez.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://newskrez.com/article/${article.slug}`,
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header categories={navCategories} user={currentUser} />

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-brandTeal-600">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          {category && (
            <Link
              href={`/category/${category.slug}`}
              className="hover:text-brandTeal-600 font-semibold"
            >
              {category.name}
            </Link>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 truncate max-w-xs">{article.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Article Content (8 cols) */}
          <article className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            {/* Category & Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {article.isBreaking && (
                <span className="bg-alertRed-600 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow">
                  Breaking
                </span>
              )}
              {category && (
                <Link
                  href={`/category/${category.slug}`}
                  className="bg-brandTeal-50 text-brandTeal-700 hover:bg-brandTeal-100 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded border border-brandTeal-200 transition-colors"
                >
                  {category.name}
                </Link>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-navy-900 leading-tight">
              {article.title}
            </h1>

            {/* Excerpt / Lead Paragraph */}
            {article.excerpt && (
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium border-l-4 border-brandTeal-500 pl-4 py-1 italic bg-slate-50 rounded-r-lg">
                {article.excerpt}
              </p>
            )}

            {/* Author & Timestamp Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-navy-900 font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-navy-900 block">
                    {author?.name || "NewsKrez Editorial Desk"}
                  </span>
                  <span className="text-[11px] text-slate-400">{publishedDateStr}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  {article.readingTimeMinutes || 3} min read
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Eye className="w-3.5 h-3.5" />
                  {article.viewsCount} views
                </span>
              </div>
            </div>

            {/* Featured Image */}
            {article.featuredImage && (
              <figure className="space-y-2">
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {article.imageCaption && (
                  <figcaption className="text-xs text-slate-400 italic text-center">
                    {article.imageCaption}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Body Content */}
            <div
              className="article-prose pt-2"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Source Attribution & Regulatory Verification Box */}
            <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-navy-900">
                <ShieldCheck className="w-4 h-4 text-brandTeal-600" />
                <span>Regulatory Verification & Source Attribution</span>
              </div>
              <p className="text-slate-600">
                This intelligence report was compiled and verified by the NewsKrez Editorial & Regulatory Intelligence Desk
                {source ? ` in conjunction with ${source.name}` : ""}.
              </p>
              {article.sourceUrl && (
                <div className="pt-1">
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brandTeal-600 hover:text-brandTeal-800 font-bold inline-flex items-center gap-1"
                  >
                    View Original Agency Release / Docket <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* In-Article Responsive Ad */}
            <AdPlacement placement="in_article" />
          </article>

          {/* Right Column: Sidebar & Related Articles (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Sidebar Ad Placement */}
            <AdPlacement placement="sidebar_top" />

            {/* Related Intelligence in Category */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-base text-navy-900 pb-2 border-b border-slate-100">
                Related Intelligence in {category?.name || "Topic"}
              </h3>
              <div className="space-y-3">
                {relatedArticles.map((rel) => (
                  <ArticleCard key={rel.id} article={rel} variant="compact" />
                ))}
              </div>
            </div>

            {/* Newsletter Mini */}
            <div className="bg-gradient-to-br from-navy-900 to-navy-950 text-white p-5 rounded-2xl border border-navy-800 space-y-3">
              <h4 className="font-serif font-bold text-sm text-white">
                Receive Daily Regulatory Alerts
              </h4>
              <p className="text-xs text-slate-300">
                Get morning briefings on FDA approvals, recalls, and life sciences compliance directly to your inbox.
              </p>
              <Link
                href="/newsletter"
                className="inline-block w-full py-2 text-center rounded-lg bg-brandTeal-600 hover:bg-brandTeal-500 font-bold text-xs uppercase tracking-wider text-white transition-colors"
              >
                Subscribe Free →
              </Link>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
