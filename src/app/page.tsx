import React from "react";
import { db, schema } from "@/db";
import { desc, eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NewsTicker } from "@/components/layout/NewsTicker";
import { HeroFeatured } from "@/components/home/HeroFeatured";
import { RegulatoryAlertsBanner } from "@/components/home/RegulatoryAlertsBanner";
import { MedicalDevicesSection } from "@/components/home/MedicalDevicesSection";
import { PharmaSection } from "@/components/home/PharmaSection";
import { RegulatoryIntelligenceSection } from "@/components/home/RegulatoryIntelligenceSection";
import { TechAISection } from "@/components/home/TechAISection";
import { TrendingSidebar } from "@/components/home/TrendingSidebar";
import { NewsletterBox } from "@/components/home/NewsletterBox";
import { AdPlacement } from "@/components/home/AdPlacement";
import { ArticleCard } from "@/components/news/ArticleCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const currentUser = await getCurrentUser();

  // 1. Fetch Categories for Navigation & Lookup Map
  const allCategories = await db.query.categories.findMany({
    where: eq(schema.categories.isActive, true),
    orderBy: [schema.categories.displayOrder],
  });

  const navCategories = allCategories.filter((c) => c.isNav);
  const catMap = new Map<number, { name: string; slug: string }>();
  for (const c of allCategories) {
    catMap.set(c.id, { name: c.name, slug: c.slug });
  }

  // 2. Fetch Breaking / Ticker Items
  const breakingArticles = await db.query.articles.findMany({
    where: and(eq(schema.articles.status, "Published"), eq(schema.articles.isBreaking, true)),
    orderBy: [desc(schema.articles.publishedAt)],
    limit: 5,
  });

  const recentAlerts = await db.query.regulatoryAlerts.findMany({
    where: eq(schema.regulatoryAlerts.status, "active"),
    orderBy: [desc(schema.regulatoryAlerts.alertDate)],
    limit: 8,
  });

  const tickerItems = [
    ...breakingArticles.map((a) => ({
      id: a.id,
      title: a.title,
      category: "Breaking",
      url: `/article/${a.slug}`,
      isAlert: true,
    })),
    ...recentAlerts.map((alt) => ({
      id: alt.id + 10000,
      title: `[${alt.agency} ${alt.recallClass || alt.alertType.toUpperCase()}] ${alt.title}`,
      category: alt.agency,
      url: `/alerts/${alt.slug}`,
      isAlert: true,
    })),
  ];

  // 3. Fetch Featured Hero Articles
  const featuredArticlesRaw = await db.query.articles.findMany({
    where: and(eq(schema.articles.status, "Published"), eq(schema.articles.isFeatured, true)),
    orderBy: [desc(schema.articles.publishedAt)],
    limit: 6,
  });

  const featuredArticles = featuredArticlesRaw.map((a) => ({
    ...a,
    categoryName: catMap.get(a.primaryCategoryId)?.name,
    categorySlug: catMap.get(a.primaryCategoryId)?.slug,
  }));

  const leadArticle = featuredArticles[0] || null;
  const secondaryArticles = featuredArticles.slice(1);

  // 4. Fetch Medical Devices News & Records
  const medDeviceCategory = allCategories.find((c) => c.slug === "medical-devices");
  const medDeviceArticlesRaw = medDeviceCategory
    ? await db.query.articles.findMany({
        where: and(
          eq(schema.articles.status, "Published"),
          eq(schema.articles.primaryCategoryId, medDeviceCategory.id)
        ),
        orderBy: [desc(schema.articles.publishedAt)],
        limit: 4,
      })
    : [];

  const medDeviceArticles = medDeviceArticlesRaw.map((a) => ({
    ...a,
    categoryName: catMap.get(a.primaryCategoryId)?.name,
    categorySlug: catMap.get(a.primaryCategoryId)?.slug,
  }));

  const recentDevices = await db.query.medicalDevices.findMany({
    orderBy: [desc(schema.medicalDevices.createdAt)],
    limit: 5,
  });

  // 5. Fetch Pharmaceutical News
  const pharmaCategory = allCategories.find((c) => c.slug === "pharmaceutical");
  const pharmaArticlesRaw = pharmaCategory
    ? await db.query.articles.findMany({
        where: and(
          eq(schema.articles.status, "Published"),
          eq(schema.articles.primaryCategoryId, pharmaCategory.id)
        ),
        orderBy: [desc(schema.articles.publishedAt)],
        limit: 3,
      })
    : [];

  const pharmaArticles = pharmaArticlesRaw.map((a) => ({
    ...a,
    categoryName: catMap.get(a.primaryCategoryId)?.name,
    categorySlug: catMap.get(a.primaryCategoryId)?.slug,
  }));

  // 6. Fetch Technology & AI News
  const techCategory = allCategories.find((c) => c.slug === "technology");
  const techArticlesRaw = techCategory
    ? await db.query.articles.findMany({
        where: and(
          eq(schema.articles.status, "Published"),
          eq(schema.articles.primaryCategoryId, techCategory.id)
        ),
        orderBy: [desc(schema.articles.publishedAt)],
        limit: 3,
      })
    : [];

  const techArticles = techArticlesRaw.map((a) => ({
    ...a,
    categoryName: catMap.get(a.primaryCategoryId)?.name,
    categorySlug: catMap.get(a.primaryCategoryId)?.slug,
  }));

  // 7. Fetch Regulatory Intelligence News
  const regCategory = allCategories.find((c) => c.slug === "regulatory-intelligence");
  const regArticlesRaw = regCategory
    ? await db.query.articles.findMany({
        where: and(
          eq(schema.articles.status, "Published"),
          eq(schema.articles.primaryCategoryId, regCategory.id)
        ),
        orderBy: [desc(schema.articles.publishedAt)],
        limit: 3,
      })
    : [];

  const regArticles = regArticlesRaw.map((a) => ({
    ...a,
    categoryName: catMap.get(a.primaryCategoryId)?.name,
    categorySlug: catMap.get(a.primaryCategoryId)?.slug,
  }));

  // 8. Trending & Most Read Articles
  const trendingRaw = await db.query.articles.findMany({
    where: eq(schema.articles.status, "Published"),
    orderBy: [desc(schema.articles.viewsCount)],
    limit: 5,
  });

  const trendingArticles = trendingRaw.map((a) => ({
    ...a,
    categoryName: catMap.get(a.primaryCategoryId)?.name,
    categorySlug: catMap.get(a.primaryCategoryId)?.slug,
  }));

  const editorsPicksRaw = await db.query.articles.findMany({
    where: and(eq(schema.articles.status, "Published"), eq(schema.articles.isEditorPick, true)),
    orderBy: [desc(schema.articles.publishedAt)],
    limit: 4,
  });

  const editorsPicks = editorsPicksRaw.map((a) => ({
    ...a,
    categoryName: catMap.get(a.primaryCategoryId)?.name,
    categorySlug: catMap.get(a.primaryCategoryId)?.slug,
  }));

  // 9. Latest Feed
  const latestArticlesRaw = await db.query.articles.findMany({
    where: eq(schema.articles.status, "Published"),
    orderBy: [desc(schema.articles.publishedAt)],
    limit: 6,
  });

  const latestArticles = latestArticlesRaw.map((a) => ({
    ...a,
    categoryName: catMap.get(a.primaryCategoryId)?.name,
    categorySlug: catMap.get(a.primaryCategoryId)?.slug,
  }));

  return (
    <div className="flex-1 flex flex-col">
      {/* Header & Sticky Nav */}
      <Header categories={navCategories} user={currentUser} />

      {/* Breaking News Ticker */}
      <NewsTicker items={tickerItems} />

      {/* Header Top AdSense Unit */}
      <AdPlacement placement="header_top" />

      {/* Hero Featured Intelligence Section */}
      <HeroFeatured
        leadArticle={leadArticle}
        secondaryArticles={secondaryArticles}
      />

      {/* Live Regulatory Recalls & Safety Alerts Banner */}
      <RegulatoryAlertsBanner alerts={recentAlerts} />

      {/* Main Content Layout with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 py-4 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed Column (8 cols) */}
          <main className="lg:col-span-8 space-y-8">
            {/* Medical Devices Module Highlight */}
            <MedicalDevicesSection
              articles={medDeviceArticles}
              recentDevices={recentDevices}
            />

            {/* Mid-feed Ad Banner */}
            <AdPlacement placement="homepage_middle" />

            {/* Pharmaceutical & Biotech Desk */}
            <PharmaSection articles={pharmaArticles} />

            {/* Regulatory Intelligence & Standards */}
            <RegulatoryIntelligenceSection articles={regArticles} />

            {/* Technology, AI & Cybersecurity */}
            <TechAISection articles={techArticles} />

            {/* Latest Global News Feed */}
            <section className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between pb-2 border-b-2 border-navy-900">
                <h3 className="font-serif font-black text-xl text-navy-900">
                  Latest Ingested News Wire
                </h3>
                <span className="text-xs text-slate-500 font-semibold uppercase">
                  Continuous Synchronization
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {latestArticles.map((art) => (
                  <ArticleCard key={art.id} article={art} variant="standard" />
                ))}
              </div>
            </section>
          </main>

          {/* Right Trending & Editorial Sidebar (4 cols) */}
          <div className="lg:col-span-4">
            <TrendingSidebar
              trendingArticles={trendingArticles}
              editorsPicks={editorsPicks}
            />
          </div>
        </div>
      </div>

      {/* Newsletter Subscription Box */}
      <div className="max-w-7xl mx-auto px-4 w-full">
        <NewsletterBox />
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
