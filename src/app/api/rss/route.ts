import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://newskrez.com";

  const allCategories = await db.query.categories.findMany();
  const catMap = new Map(allCategories.map((c) => [c.id, c.name]));

  const articles = await db.query.articles.findMany({
    where: eq(schema.articles.status, "Published"),
    orderBy: [desc(schema.articles.publishedAt)],
    limit: 30,
  });

  const rssItems = articles
    .map((a) => {
      const pubDate = a.publishedAt ? new Date(a.publishedAt).toUTCString() : new Date().toUTCString();
      const escapedTitle = (a.title || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const escapedDesc = (a.excerpt || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const categoryName = catMap.get(a.primaryCategoryId) || "Regulatory Intelligence";

      return `
    <item>
      <title>${escapedTitle}</title>
      <link>${baseUrl}/article/${a.slug}</link>
      <guid isPermaLink="true">${baseUrl}/article/${a.slug}</guid>
      <description>${escapedDesc}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${categoryName}</category>
      <author>editor@newskrez.com (NewsKrez Editorial Desk)</author>
    </item>`;
    })
    .join("");

  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>NewsKrez - Global News &amp; Regulatory Intelligence</title>
    <link>${baseUrl}</link>
    <description>Global News. Healthcare. Technology. Regulatory Intelligence. Authoritative biopharma, medical device clearances, and FDA recalls.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/api/rss" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=600, stale-while-revalidate",
    },
  });
}
