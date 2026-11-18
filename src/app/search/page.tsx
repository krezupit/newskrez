import React from "react";
import { db, schema } from "@/db";
import { and, desc, like, or, eq } from "drizzle-orm";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/auth";
import { ArticleCard } from "@/components/news/ArticleCard";
import { Search, ChevronRight, Filter } from "lucide-react";

interface SearchPageProps {
  searchParams: {
    q?: string;
    cat?: string;
  };
}

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const currentUser = await getCurrentUser();
  const query = searchParams.q || "";
  const catFilter = searchParams.cat || "all";

  const navCategories = await db.query.categories.findMany({
    where: and(eq(schema.categories.isActive, true), eq(schema.categories.isNav, true)),
    orderBy: [schema.categories.displayOrder],
  });

  let results: any[] = [];

  if (query.trim()) {
    const searchTerm = `%${query.trim()}%`;

    const whereConditions = [
      eq(schema.articles.status, "Published"),
      or(
        like(schema.articles.title, searchTerm),
        like(schema.articles.excerpt, searchTerm),
        like(schema.articles.content, searchTerm)
      ),
    ];

    if (catFilter !== "all") {
      const selectedCat = navCategories.find((c) => c.slug === catFilter);
      if (selectedCat) {
        whereConditions.push(eq(schema.articles.primaryCategoryId, selectedCat.id));
      }
    }

    const rawResults = await db.query.articles.findMany({
      where: and(...whereConditions),
      orderBy: [desc(schema.articles.publishedAt)],
      limit: 30,
      with: { primaryCategory: true },
    });

    results = rawResults.map((r) => ({
      ...r,
      categoryName: r.primaryCategory?.name,
      categorySlug: r.primaryCategory?.slug,
    }));
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header categories={navCategories} user={currentUser} />

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {/* Search Input Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <form method="GET" className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search across 510(k), PMA, drug approvals, recalls, QMSR..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-brandTeal-500"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <select
              name="cat"
              defaultValue={catFilter}
              className="px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-brandTeal-500"
            >
              <option value="all">All Desks & Categories</option>
              {navCategories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="px-8 py-3 bg-navy-900 hover:bg-brandTeal-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm"
            >
              Search
            </button>
          </form>

          {query && (
            <div className="text-xs text-slate-500 pt-1">
              Found <strong>{results.length}</strong> intelligence records for &ldquo;
              <span className="text-navy-900 font-bold">{query}</span>&rdquo;
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((art) => (
              <ArticleCard key={art.id} article={art} variant="standard" />
            ))}
          </div>

          {query && results.length === 0 && (
            <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
              <Search className="w-10 h-10 mx-auto text-slate-400 mb-3" />
              <h3 className="font-serif font-bold text-lg text-navy-900">
                No Results Found
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Try searching for broader terms like &ldquo;FDA&rdquo;, &ldquo;device&rdquo;, &ldquo;recall&rdquo;, or &ldquo;oncology&rdquo;.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
