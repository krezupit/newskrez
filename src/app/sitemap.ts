import { MetadataRoute } from "next";
import { db, schema } from "@/db";
import { eq, desc } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://newskrez.com";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/medical-devices`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/alerts`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/newsletter`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/editorial-standards`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // Categories
  const categories = await db.query.categories.findMany({
    where: eq(schema.categories.isActive, true),
  });

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${baseUrl}/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Articles
  const articles = await db.query.articles.findMany({
    where: eq(schema.articles.status, "Published"),
    orderBy: [desc(schema.articles.publishedAt)],
    limit: 100,
  });

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${baseUrl}/article/${a.slug}`,
    lastModified: a.updatedAt ? new Date(a.updatedAt) : new Date(),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  // Alerts
  const alerts = await db.query.regulatoryAlerts.findMany({
    orderBy: [desc(schema.regulatoryAlerts.alertDate)],
    limit: 50,
  });

  const alertRoutes: MetadataRoute.Sitemap = alerts.map((alt) => ({
    url: `${baseUrl}/alerts/${alt.slug}`,
    lastModified: alt.updatedAt ? new Date(alt.updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes, ...alertRoutes];
}
