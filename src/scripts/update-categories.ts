import { db, schema } from "../db";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Updating category hierarchy and ordering...");

  // 1. Update parent categories
  const parentUpdates = [
    { slug: "general-news", name: "General News", displayOrder: 1 },
    { slug: "pharmaceutical", name: "Pharmaceutical", displayOrder: 2 },
    { slug: "medical-devices", name: "Medical Devices", displayOrder: 3 },
    { slug: "fda-news", name: "FDA News", displayOrder: 4 },
    { slug: "who-healthcare", name: "WHO & Healthcare", displayOrder: 5 },
    { slug: "technology", name: "Technology", displayOrder: 6 },
    { slug: "regulatory-intelligence", name: "Regulatory Intelligence & Compliance", displayOrder: 7 },
  ];

  for (const p of parentUpdates) {
    const existing = await db.query.categories.findFirst({
      where: eq(schema.categories.slug, p.slug),
    });

    if (existing) {
      await db
        .update(schema.categories)
        .set({ name: p.name, displayOrder: p.displayOrder, parentId: null })
        .where(eq(schema.categories.id, existing.id));
      console.log(`Updated parent ${p.name} -> displayOrder: ${p.displayOrder}`);
    } else {
      await db.insert(schema.categories).values({
        name: p.name,
        slug: p.slug,
        displayOrder: p.displayOrder,
        parentId: null,
        description: `Official ${p.name} category for NewsKrez.`,
      });
      console.log(`Inserted parent ${p.name} -> displayOrder: ${p.displayOrder}`);
    }
  }

  // Get General News parent ID
  const generalNewsParent = await db.query.categories.findFirst({
    where: eq(schema.categories.slug, "general-news"),
  });

  if (!generalNewsParent) {
    throw new Error("Could not find general-news parent category!");
  }

  const parentId = generalNewsParent.id;

  // 2. Define the 12 General News subcategories
  const generalSubcategories = [
    { name: "India News", slug: "india-news", displayOrder: 1, desc: "Latest headlines, national affairs, politics, economy, and updates from India." },
    { name: "World News", slug: "world-news", displayOrder: 2, desc: "Global diplomacy, international affairs, geopolitical updates, and global events." },
    { name: "Politics", slug: "politics", displayOrder: 3, desc: "Elections, governance, policy debates, parliamentary affairs, and political news." },
    { name: "Business & Economy", slug: "business-economy", displayOrder: 4, desc: "Markets, economic policies, corporate developments, trade, and financial trends." },
    { name: "Sports", slug: "sports", displayOrder: 5, desc: "Cricket, football, Olympics, motorsports, tournaments, and athlete achievements." },
    { name: "Entertainment", slug: "entertainment", displayOrder: 6, desc: "Cinema, streaming releases, culture, celebrities, music, and creative arts." },
    { name: "Education", slug: "education", displayOrder: 7, desc: "Higher education, scientific research institutions, universities, and academic policy." },
    { name: "Science", slug: "science", displayOrder: 8, desc: "Breakthrough discoveries, space exploration, physics, biotechnology, and innovation." },
    { name: "Environment", slug: "environment", displayOrder: 9, desc: "Climate change, conservation, renewable energy, and ecological initiatives." },
    { name: "Government Updates", slug: "government-updates", displayOrder: 10, desc: "Official gazette notifications, ministry circulars, regulatory announcements, and public schemes." },
    { name: "Breaking News", slug: "breaking-news", displayOrder: 11, desc: "Urgent breaking alerts, developing stories, and real-time live reporting." },
    { name: "Trending News", slug: "trending-news", displayOrder: 12, desc: "Viral stories, most discussed digital topics, and high-engagement global discussions." },
  ];

  for (const sub of generalSubcategories) {
    const existing = await db.query.categories.findFirst({
      where: eq(schema.categories.slug, sub.slug),
    });

    if (existing) {
      await db
        .update(schema.categories)
        .set({
          name: sub.name,
          parentId: parentId,
          displayOrder: sub.displayOrder,
          description: sub.desc,
          isActive: true,
        })
        .where(eq(schema.categories.id, existing.id));
      console.log(`Updated subcategory: ${sub.name} (${sub.slug})`);
    } else {
      await db.insert(schema.categories).values({
        name: sub.name,
        slug: sub.slug,
        parentId: parentId,
        displayOrder: sub.displayOrder,
        description: sub.desc,
        isActive: true,
      });
      console.log(`Created subcategory: ${sub.name} (${sub.slug})`);
    }
  }

  // 3. Add / Update Sources for General News subcategories with verified accessible feeds
  const generalSources = [
    {
      name: "The Hindu – India National News",
      code: "hindu_india_national",
      type: "rss_general",
      baseUrl: "https://www.thehindu.com",
      feedUrl: "https://www.thehindu.com/news/national/feeder/default.rss",
      categorySlug: "india-news",
      autoPublish: true,
      fetchIntervalMinutes: 30,
    },
    {
      name: "BBC News – World Headlines",
      code: "bbc_world_news",
      type: "rss_general",
      baseUrl: "https://www.bbc.co.uk",
      feedUrl: "https://feeds.bbci.co.uk/news/world/rss.xml",
      categorySlug: "world-news",
      autoPublish: true,
      fetchIntervalMinutes: 30,
    },
    {
      name: "BBC News – Politics & Governance",
      code: "bbc_politics_news",
      type: "rss_general",
      baseUrl: "https://www.bbc.co.uk",
      feedUrl: "https://feeds.bbci.co.uk/news/politics/rss.xml",
      categorySlug: "politics",
      autoPublish: true,
      fetchIntervalMinutes: 30,
    },
    {
      name: "BBC News – Global Business & Economy",
      code: "bbc_business_economy",
      type: "rss_general",
      baseUrl: "https://www.bbc.co.uk",
      feedUrl: "https://feeds.bbci.co.uk/news/business/rss.xml",
      categorySlug: "business-economy",
      autoPublish: true,
      fetchIntervalMinutes: 30,
    },
    {
      name: "BBC Sport – International Athletics & Games",
      code: "bbc_sports_news",
      type: "rss_general",
      baseUrl: "https://www.bbc.co.uk",
      feedUrl: "https://feeds.bbci.co.uk/sport/rss.xml",
      categorySlug: "sports",
      autoPublish: true,
      fetchIntervalMinutes: 30,
    },
    {
      name: "BBC News – Entertainment, Culture & Arts",
      code: "bbc_entertainment_arts",
      type: "rss_general",
      baseUrl: "https://www.bbc.co.uk",
      feedUrl: "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml",
      categorySlug: "entertainment",
      autoPublish: true,
      fetchIntervalMinutes: 30,
    },
    {
      name: "The Hindu – Education & Academia",
      code: "hindu_education_news",
      type: "rss_general",
      baseUrl: "https://www.thehindu.com",
      feedUrl: "https://www.thehindu.com/education/feeder/default.rss",
      categorySlug: "education",
      autoPublish: true,
      fetchIntervalMinutes: 60,
    },
    {
      name: "BBC News – Science & Discovery",
      code: "bbc_science_discovery",
      type: "rss_general",
      baseUrl: "https://www.bbc.co.uk",
      feedUrl: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
      categorySlug: "science",
      autoPublish: true,
      fetchIntervalMinutes: 30,
    },
    {
      name: "The Hindu – Environment & Climate",
      code: "hindu_environment_climate",
      type: "rss_general",
      baseUrl: "https://www.thehindu.com",
      feedUrl: "https://www.thehindu.com/sci-tech/energy-and-environment/feeder/default.rss",
      categorySlug: "environment",
      autoPublish: true,
      fetchIntervalMinutes: 60,
    },
    {
      name: "The Hindu – Government & Policy Circulars",
      code: "hindu_government_policy",
      type: "rss_general",
      baseUrl: "https://www.thehindu.com",
      feedUrl: "https://www.thehindu.com/news/national/feeder/default.rss",
      categorySlug: "government-updates",
      autoPublish: true,
      fetchIntervalMinutes: 60,
    },
    {
      name: "BBC News – Breaking & Top Headlines",
      code: "bbc_top_breaking",
      type: "rss_general",
      baseUrl: "https://www.bbc.co.uk",
      feedUrl: "https://feeds.bbci.co.uk/news/rss.xml",
      categorySlug: "breaking-news",
      autoPublish: true,
      fetchIntervalMinutes: 30,
    },
    {
      name: "BBC News – Trending & Digital Culture",
      code: "bbc_trending_topics",
      type: "rss_general",
      baseUrl: "https://www.bbc.co.uk",
      feedUrl: "https://feeds.bbci.co.uk/news/technology/rss.xml",
      categorySlug: "trending-news",
      autoPublish: true,
      fetchIntervalMinutes: 30,
    },
  ];

  for (const src of generalSources) {
    const existing = await db.query.sources.findFirst({
      where: eq(schema.sources.code, src.code),
    });

    if (existing) {
      await db
        .update(schema.sources)
        .set({
          name: src.name,
          feedUrl: src.feedUrl,
          categorySlug: src.categorySlug,
          autoPublish: src.autoPublish,
          fetchIntervalMinutes: src.fetchIntervalMinutes,
          isActive: true,
        })
        .where(eq(schema.sources.id, existing.id));
      console.log(`Updated source: ${src.name}`);
    } else {
      await db.insert(schema.sources).values(src);
      console.log(`Inserted source: ${src.name}`);
    }
  }

  console.log("Categories and Sources successfully updated!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
