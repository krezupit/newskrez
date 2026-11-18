import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Strips invalid XML 1.0 control characters
 */
function stripInvalidXmlChars(text: string): string {
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

/**
 * Escapes characters for XML attribute or URL tags
 */
function escapeXml(text: string | null | undefined): string {
  if (!text) return "";
  return stripInvalidXmlChars(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Wraps content in CDATA, safely escaping any embedded ']]>' sequences
 */
function toCdata(text: string | null | undefined): string {
  if (!text) return "<![CDATA[]]>";
  const clean = stripInvalidXmlChars(text).replace(/]]>/g, "]]]]><![CDATA[>");
  return `<![CDATA[${clean}]]>`;
}

export async function GET(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3001";
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

  const allCategories = await db.query.categories.findMany();
  const catMap = new Map(allCategories.map((c) => [c.id, c.name]));

  const articles = await db.query.articles.findMany({
    where: eq(schema.articles.status, "Published"),
    orderBy: [desc(schema.articles.publishedAt)],
    limit: 50,
  });

  const rssItems = articles
    .map((a) => {
      const pubDate = a.publishedAt ? new Date(a.publishedAt).toUTCString() : new Date().toUTCString();
      const articleUrl = `${baseUrl}/article/${encodeURIComponent(a.slug)}`;
      const categoryName = catMap.get(a.primaryCategoryId) || "General News";

      return `
    <item>
      <title>${toCdata(a.title)}</title>
      <link>${escapeXml(articleUrl)}</link>
      <guid isPermaLink="true">${escapeXml(articleUrl)}</guid>
      <description>${toCdata(a.excerpt || a.content?.slice(0, 300) || "")}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${toCdata(categoryName)}</category>
      <author>editor@newskrez.com (NewsKrez Editorial Desk)</author>
    </item>`;
    })
    .join("");

  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>NewsKrez - Global News &amp; Regulatory Intelligence</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>Global News. Healthcare. Technology. Regulatory Intelligence. Authoritative biopharma, medical device clearances, and FDA recalls.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(`${baseUrl}/api/rss`)}" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
    },
  });
}
