import React from "react";
import { db, schema } from "@/db";
import { eq, and, desc, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/auth";
import { ArticleCard } from "@/components/news/ArticleCard";
import { AdPlacement } from "@/components/home/AdPlacement";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, Folder } from "lucide-react";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const cat = await db.query.categories.findFirst({
    where: eq(schema.categories.slug, params.slug),
  });

  if (!cat) {
    return { title: "Category Not Found | NewsKrez" };
  }

  const title = cat.metaTitle || `${cat.name} News & Regulatory Intelligence | NewsKrez`;
  const description =
    cat.metaDescription || cat.description || `Latest ${cat.name} news on NewsKrez.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://newskrez.com/category/${cat.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const currentUser = await getCurrentUser();

  const category = await db.query.categories.findFirst({
    where: eq(schema.categories.slug, params.slug),
  });

  if (!category) {
    notFound();
  }

  const subcategories = await db.query.categories.findMany({
    where: eq(schema.categories.parentId, category.id),
  });

  const parent = category.parentId
    ? await db.query.categories.findFirst({
        where: eq(schema.categories.id, category.parentId),
      })
    : null;

  // Fetch nav categories
  const navCategories = await db.query.categories.findMany({
    where: and(eq(schema.categories.isActive, true), eq(schema.categories.isNav, true)),
    orderBy: [schema.categories.displayOrder],
    limit: 10,
  });

  // Collect category IDs (parent + all child subcategory IDs)
  const catIds = [category.id, ...subcategories.map((s) => s.id)];

  const articlesRaw = await db.query.articles.findMany({
    where: and(
      eq(schema.articles.status, "Published"),
      inArray(schema.articles.primaryCategoryId, catIds)
    ),
    orderBy: [desc(schema.articles.publishedAt)],
    limit: 24,
  });

  const articles = articlesRaw.map((a) => ({
    ...a,
    categoryName: category.name,
    categorySlug: category.slug,
  }));

  const leadArticle = articles[0] || null;
  const restArticles = articles.slice(1);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header categories={navCategories} user={currentUser} />

      {/* Category Hero Header */}
      <section className="bg-navy-950 text-white py-10 px-4 border-b border-navy-800">
        <div className="max-w-7xl mx-auto space-y-3">
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            {parent && (
              <>
                <Link
                  href={`/category/${parent.slug}`}
                  className="hover:text-white"
                >
                  {parent.name}
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </>
            )}
            <span className="text-brandTeal-400 font-semibold">{category.name}</span>
          </nav>

          <h1 className="text-2xl sm:text-4xl font-serif font-black text-white">
            {category.name}
          </h1>

          {category.description && (
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {category.description}
            </p>
          )}

          {/* Subcategories Pills */}
          {subcategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-3">
              <span className="text-xs text-slate-400 font-semibold mr-1">
                Subcategories:
              </span>
              {subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/category/${sub.slug}`}
                  className="px-3 py-1 rounded-full bg-navy-800 hover:bg-brandTeal-600 hover:text-white text-slate-300 text-xs transition-colors border border-navy-700"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Category Feed */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        {leadArticle && (
          <div className="mb-8">
            <ArticleCard article={leadArticle} variant="hero" />
          </div>
        )}

        <AdPlacement placement="homepage_middle" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restArticles.map((art) => (
            <ArticleCard key={art.id} article={art} variant="standard" />
          ))}
        </div>

        {articles.length === 0 && (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            <Folder className="w-10 h-10 mx-auto text-slate-400 mb-3" />
            <h3 className="font-serif font-bold text-lg text-navy-900">
              No Articles Published in this Desk Yet
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Articles will appear as new regulatory notices and feeds are synchronized.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
