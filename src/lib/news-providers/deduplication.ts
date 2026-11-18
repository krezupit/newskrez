import crypto from "crypto";
import slugify from "slugify";
import { db, schema } from "@/db";
import { eq, or } from "drizzle-orm";

/**
 * Normalizes a URL by removing tracking query parameters, hashes, and trailing slashes.
 */
export function normalizeCanonicalUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl.trim());

    // Tracking parameters to strip
    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "fbclid",
      "gclid",
      "_ga",
      "ref",
      "source",
      "ncid",
      "ocid",
    ];

    for (const param of trackingParams) {
      url.searchParams.delete(param);
    }

    url.hash = "";
    let clean = url.toString();
    if (clean.endsWith("/") && clean.length > url.origin.length + 1) {
      clean = clean.slice(0, -1);
    }
    return clean;
  } catch (e) {
    return rawUrl.trim();
  }
}

/**
 * Computes a SHA-256 hash of a clean URL for instant indexed deduplication.
 */
export function hashUrl(cleanUrl: string): string {
  return crypto.createHash("sha256").update(cleanUrl.toLowerCase()).digest("hex");
}

/**
 * Creates an SEO-friendly unique slug from a headline.
 */
export function createSafeSlug(title: string): string {
  const base = slugify(title, {
    lower: true,
    strict: true,
    trim: true,
    remove: /[*+~.()'"!:@]/g,
  });
  const randomSuffix = crypto.randomBytes(3).toString("hex");
  const truncated = base.slice(0, 100);
  return `${truncated}-${randomSuffix}`;
}

/**
 * Checks whether an article already exists in the MySQL database
 * by matching URL hash or external record ID.
 */
export async function isDuplicateArticle(
  sourceUrlHash: string,
  externalRecordId: string
): Promise<boolean> {
  const existing = await db.query.articles.findFirst({
    where: or(
      eq(schema.articles.sourceUrlHash, sourceUrlHash),
      eq(schema.articles.externalRecordId, externalRecordId)
    ),
    columns: { id: true },
  });

  return Boolean(existing);
}
