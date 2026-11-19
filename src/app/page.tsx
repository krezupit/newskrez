import React from "react";
import { db, schema } from "@/db";
import { desc, eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NewsTicker } from "@/components/layout/NewsTicker";
import { GeneralNewsHero } from "@/components/home/GeneralNewsHero";
import { GeneralNewsTabs } from "@/components/home/GeneralNewsTabs";
import { CategorySectionBlock } from "@/components/home/CategorySectionBlock";
import { MedicalDevicesSection } from "@/components/home/MedicalDevicesSection";
import { PharmaSection } from "@/components/home/PharmaSection";
import { RegulatoryIntelligenceSection } from "@/components/home/RegulatoryIntelligenceSection";
import { TechAISection } from "@/components/home/TechAISection";
import { TrendingSidebar } from "@/components/home/TrendingSidebar";
import { NewsletterBox } from "@/components/home/NewsletterBox";
import { AdPlacement } from "@/components/home/AdPlacement";
import { RegulatoryAlertsBanner } from "@/components/home/RegulatoryAlertsBanner";
import {
  Flag,
  Globe,
  Landmark,
  TrendingUp,
  Trophy,
  Film,
  ShieldAlert,
  HeartPulse,
  Flame,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const currentUser = await getCurrentUser();

  // 1. Fetch Categories for Navigation & Lookup Map
  const allCategories = await db.query.categories.findMany({
    where: eq(schema.categories.isActive, true),
    orderBy: [schema.categories.displayOrder],
  });

  const catMap = new Map<number, { name: string; slug: string; parentId: number | null }>();
  const slugToId = new Map<string, number>();
  for (const c of allCategories) {
    catMap.set(c.id, { name: c.name, slug: c.slug, parentId: c.parentId });
    slugToId.set(c.slug, c.id);
  }

  // 2. Fetch Breaking / Ticker Items & Alerts
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

  // 3. Batch Fetch All Published Articles (Single Query for Peak Performance)
  const allPublished = await db.query.articles.findMany({
    where: eq(schema.articles.status, "Published"),
    orderBy: [desc(schema.articles.publishedAt)],
    limit: 200,
  });

  // Map each article with category name and slug
  const hydratedArticles = allPublished.map((a) => {
    const meta = catMap.get(a.primaryCategoryId);
    return {
      ...a,
      categoryName: meta?.name || "General News",
      categorySlug: meta?.slug || "general-news",
      parentId: meta?.parentId,
    };
  });

  // General News Parent ID
  const generalNewsParentId = slugToId.get("general-news") || 57;

  // Filter General News Articles (Direct or Subcategories)
  const generalArticles = hydratedArticles.filter(
    (a) =>
      a.categorySlug === "general-news" ||
      a.parentId === generalNewsParentId ||
      [
        "india-news",
        "world-news",
        "politics",
        "business-economy",
        "sports",
        "entertainment",
        "education",
        "science",
        "environment",
        "government-updates",
        "breaking-news",
        "trending-news",
      ].includes(a.categorySlug)
  );

  // Section 3: General News Featured Hero Carousel (Dynamic Top Fresh Stories)
  // Sort fresh articles: breaking first, then newest publishedAt
  const sortedGeneral = [...generalArticles].sort((a, b) => {
    if (a.isBreaking && !b.isBreaking) return -1;
    if (!a.isBreaking && b.isBreaking) return 1;
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return dateB - dateA;
  });

  const heroCarouselArticles = sortedGeneral.slice(0, 6);
  const carouselIds = new Set(heroCarouselArticles.map((a) => a.id));
  const generalHeroSecondary = sortedGeneral
    .filter((a) => !carouselIds.has(a.id))
    .slice(0, 4);

  // Subcategory Partitioning for Sections 5 through 10
  const indiaArticles = hydratedArticles.filter((a) => a.categorySlug === "india-news");
  const worldArticles = hydratedArticles.filter((a) => a.categorySlug === "world-news");
  const politicsArticles = hydratedArticles.filter((a) => a.categorySlug === "politics");
  const businessArticles = hydratedArticles.filter((a) => a.categorySlug === "business-economy");
  const sportsArticles = hydratedArticles.filter((a) => a.categorySlug === "sports");
  const entertainmentArticles = hydratedArticles.filter((a) => a.categorySlug === "entertainment");

  // Specialized News Sections (11 through 16)
  const pharmaArticles = hydratedArticles.filter((a) => a.categorySlug === "pharmaceutical");
  const medDeviceArticles = hydratedArticles.filter((a) => a.categorySlug === "medical-devices");
  const fdaArticles = hydratedArticles.filter((a) => a.categorySlug === "fda-news");
  const whoArticles = hydratedArticles.filter((a) => a.categorySlug === "who-healthcare");
  const techArticles = hydratedArticles.filter((a) => a.categorySlug === "technology");
  const regArticles = hydratedArticles.filter((a) => a.categorySlug === "regulatory-intelligence");

  // Medical Devices live records
  const recentDevices = await db.query.medicalDevices.findMany({
    orderBy: [desc(schema.medicalDevices.createdAt)],
    limit: 5,
  });

  // Section 17: Trending News & Editor Picks
  const trendingArticles = [...hydratedArticles]
    .sort((a, b) => b.viewsCount - a.viewsCount)
    .slice(0, 6);

  const editorsPicks = hydratedArticles.filter((a) => a.isEditorPick).slice(0, 4);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header & Sticky Nav with General News Mega Dropdown */}
      <Header categories={allCategories} user={currentUser} />

      {/* 1. Breaking News Ticker */}
      <NewsTicker items={tickerItems} />

      {/* 2. Top Advertisement Banner */}
      <AdPlacement placement="header_top" />

      {/* 3. General News Featured Hero Section (Highest Visual Priority Carousel) */}
      <GeneralNewsHero
        carouselArticles={heroCarouselArticles}
        secondaryArticles={generalHeroSecondary}
      />

      {/* Live Regulatory Recalls & Safety Alerts Sentinel */}
      <RegulatoryAlertsBanner alerts={recentAlerts} />

      {/* Main Content Layout with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 py-4 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed Column (8 cols) - Structured strictly in requested order */}
          <main className="lg:col-span-8 space-y-10">
            {/* 4. Latest General News (with Category Tabs) */}
            <GeneralNewsTabs articles={generalArticles} />

            {/* Middle Advertisement Unit */}
            <AdPlacement placement="homepage_middle" />

            {/* 5. India News */}
            <CategorySectionBlock
              title="India News"
              categorySlug="india-news"
              tagline="National politics, state affairs, economic policies and cultural developments"
              icon={Flag}
              badge="National Desk"
              articles={indiaArticles}
            />

            {/* 6. World News */}
            <CategorySectionBlock
              title="World News"
              categorySlug="world-news"
              tagline="International diplomacy, geopolitical security, conflicts and global summits"
              icon={Globe}
              badge="Global Bureau"
              articles={worldArticles}
            />

            {/* 7. Politics */}
            <CategorySectionBlock
              title="Politics"
              categorySlug="politics"
              tagline="Elections, legislative debates, parliamentary bills, and party strategy"
              icon={Landmark}
              badge="Capitol & States"
              articles={politicsArticles}
            />

            {/* 8. Business & Economy */}
            <CategorySectionBlock
              title="Business & Economy"
              categorySlug="business-economy"
              tagline="Financial markets, corporate earnings, trade agreements, and macroeconomic trends"
              icon={TrendingUp}
              badge="Markets & Capital"
              articles={businessArticles}
            />

            {/* 9. Sports */}
            <CategorySectionBlock
              title="Sports"
              categorySlug="sports"
              tagline="Cricket, football championships, Olympic updates, and athlete milestones"
              icon={Trophy}
              badge="Athletics Wire"
              articles={sportsArticles}
            />

            {/* 10. Entertainment */}
            <CategorySectionBlock
              title="Entertainment"
              categorySlug="entertainment"
              tagline="Cinema, box office releases, streaming series, culture, and artist profiles"
              icon={Film}
              badge="Arts & Screen"
              articles={entertainmentArticles}
            />

            {/* 11. Pharmaceutical News */}
            <PharmaSection articles={pharmaArticles} />

            {/* 12. Medical Devices News */}
            <MedicalDevicesSection
              articles={medDeviceArticles}
              recentDevices={recentDevices}
            />

            {/* 13. FDA News */}
            <CategorySectionBlock
              title="FDA News"
              categorySlug="fda-news"
              tagline="Official US Food and Drug Administration drug approvals, recalls & warning letters"
              icon={ShieldAlert}
              badge="US Agency Sentinel"
              articles={fdaArticles}
            />

            {/* 14. WHO & Healthcare */}
            <CategorySectionBlock
              title="WHO & Healthcare"
              categorySlug="who-healthcare"
              tagline="World Health Organization outbreaks, health surveillance and medical innovation"
              icon={HeartPulse}
              badge="Public Health"
              articles={whoArticles}
            />

            {/* 15. Technology */}
            <TechAISection articles={techArticles} />

            {/* 16. Regulatory Intelligence & Compliance */}
            <RegulatoryIntelligenceSection articles={regArticles} />
          </main>

          {/* Right Trending & Editorial Sidebar (4 cols) - Section 17 */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 space-y-6">
              <TrendingSidebar
                trendingArticles={trendingArticles}
                editorsPicks={editorsPicks}
              />
              <AdPlacement placement="sidebar_top" />
            </div>
          </div>
        </div>
      </div>

      {/* 18. Newsletter Subscription */}
      <div className="max-w-7xl mx-auto px-4 py-8 w-full">
        <NewsletterBox />
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
