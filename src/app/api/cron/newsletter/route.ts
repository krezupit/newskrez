import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { and, desc, eq, inArray } from "drizzle-orm";
import { sendEmail, checkDailySendingQuota } from "@/lib/email/mailer";
import { renderDailyNewsletterEmail } from "@/lib/email/templates";

export const dynamic = "force-dynamic";

/**
 * Hostinger Cron Endpoint: Automatic Daily News Newsletter
 * Triggered daily (e.g. at 08:00 AM UTC) via Hostinger Cron or external trigger
 * Secured with CRON_SECRET token
 */
export async function GET(req: NextRequest) {
  return handleNewsletterDispatch(req);
}

export async function POST(req: NextRequest) {
  return handleNewsletterDispatch(req);
}

async function handleNewsletterDispatch(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret") || req.headers.get("x-cron-secret");
  const expectedSecret = process.env.CRON_SECRET || "newskrez-cron-trigger-secure-token-99482";

  if (secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized cron token." }, { status: 401 });
  }

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "newskrez.com";
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

  try {
    // 1. Check daily sending quota
    const quota = await checkDailySendingQuota();
    if (!quota.allowed) {
      return NextResponse.json({
        success: false,
        message: `Daily sending limit reached (${quota.sentToday}/${quota.limit}). Aborting newsletter dispatch.`,
      });
    }

    // 2. Fetch today's top published articles
    const allCategories = await db.query.categories.findMany();
    const catMap = new Map(allCategories.map((c) => [c.id, c.name]));

    const articles = await db.query.articles.findMany({
      where: eq(schema.articles.status, "Published"),
      orderBy: [desc(schema.articles.publishedAt)],
      limit: 6,
    });

    if (articles.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No published articles available to assemble daily newsletter.",
        dispatched: 0,
      });
    }

    const newsletterArticles = articles.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      categoryName: catMap.get(a.primaryCategoryId) || "General News",
      imageUrl: a.featuredImage,
    }));

    // 3. Query active and verified subscribers eligible for daily digest
    const subscribers = await db.query.newsletterSubscribers.findMany({
      where: and(
        eq(schema.newsletterSubscribers.isActive, true),
        eq(schema.newsletterSubscribers.isVerified, true),
        inArray(schema.newsletterSubscribers.frequency, ["daily", "breaking_alerts"])
      ),
      limit: quota.remaining,
    });

    if (subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active verified subscribers eligible for daily newsletter.",
        dispatched: 0,
      });
    }

    let sentCount = 0;
    let failedCount = 0;

    // 4. Dispatch with throttling
    for (const sub of subscribers) {
      const { subject, html, text } = renderDailyNewsletterEmail(
        newsletterArticles,
        sub.token,
        baseUrl
      );

      const result = await sendEmail({
        to: sub.email,
        subject,
        html,
        text,
        emailType: "daily_newsletter",
        metadata: {
          subscriberId: sub.id,
          articlesCount: newsletterArticles.length,
        },
      });

      if (result.success) {
        sentCount++;
      } else {
        failedCount++;
      }

      // Small 150ms pause between recipients to prevent SMTP burst flood
      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    const updatedQuota = await checkDailySendingQuota();

    return NextResponse.json({
      success: true,
      message: `Daily newsletter dispatch completed. Sent: ${sentCount}, Failed: ${failedCount}.`,
      sentCount,
      failedCount,
      totalSubscribers: subscribers.length,
      quotaRemaining: updatedQuota.remaining,
    });
  } catch (error: any) {
    console.error("Daily newsletter cron error:", error);
    return NextResponse.json(
      { error: "Failed to dispatch daily newsletter", details: error.message },
      { status: 500 }
    );
  }
}
