import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { sendEmail, checkDailySendingQuota } from "@/lib/email/mailer";
import { renderBreakingAlertEmail } from "@/lib/email/templates";

export const dynamic = "force-dynamic";

/**
 * Hostinger Cron / Trigger: Breaking News Email Alerts
 * Dispatches high-priority bulletins for breaking articles
 */
export async function GET(req: NextRequest) {
  return handleBreakingAlerts(req);
}

export async function POST(req: NextRequest) {
  return handleBreakingAlerts(req);
}

async function handleBreakingAlerts(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret") || req.headers.get("x-cron-secret");
  const expectedSecret = process.env.CRON_SECRET || "newskrez-cron-trigger-secure-token-99482";

  if (secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized cron token." }, { status: 401 });
  }

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "newskrez.com";
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

  const articleIdParam = searchParams.get("articleId");

  try {
    let targetArticle;

    if (articleIdParam) {
      targetArticle = await db.query.articles.findFirst({
        where: eq(schema.articles.id, parseInt(articleIdParam, 10)),
      });
    } else {
      // Find latest breaking article published within the last 4 hours
      const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
      const candidates = await db.query.articles.findMany({
        where: and(
          eq(schema.articles.status, "Published"),
          eq(schema.articles.isBreaking, true)
        ),
        orderBy: [desc(schema.articles.publishedAt)],
        limit: 1,
      });
      targetArticle = candidates[0];
    }

    if (!targetArticle) {
      return NextResponse.json({
        success: true,
        message: "No unalerted breaking news article found.",
        dispatched: 0,
      });
    }

    // Check if this article was already alerted to prevent duplicate spam
    const existingLog = await db.query.emailLogs.findFirst({
      where: and(
        eq(schema.emailLogs.emailType, "breaking_alert"),
        sql`JSON_EXTRACT(${schema.emailLogs.metadata}, '$.articleId') = ${targetArticle.id}`
      ),
    });

    if (existingLog && !articleIdParam) {
      return NextResponse.json({
        success: true,
        message: `Article #${targetArticle.id} was already dispatched as a breaking alert.`,
        dispatched: 0,
      });
    }

    // Check daily quota
    const quota = await checkDailySendingQuota();
    if (!quota.allowed) {
      return NextResponse.json({
        success: false,
        message: `Daily email quota reached (${quota.sentToday}/${quota.limit}). Throttling breaking alert.`,
      });
    }

    // Fetch category name
    let categoryName = "General News";
    if (targetArticle.primaryCategoryId) {
      const cat = await db.query.categories.findFirst({
        where: eq(schema.categories.id, targetArticle.primaryCategoryId),
      });
      if (cat) categoryName = cat.name;
    }

    // Query subscribers opted in to breaking alerts or daily
    const subscribers = await db.query.newsletterSubscribers.findMany({
      where: and(
        eq(schema.newsletterSubscribers.isActive, true),
        eq(schema.newsletterSubscribers.isVerified, true),
        inArray(schema.newsletterSubscribers.frequency, ["daily", "breaking_alerts"])
      ),
      limit: quota.remaining,
    });

    let sent = 0;
    let failed = 0;

    for (const sub of subscribers) {
      const { subject, html, text } = renderBreakingAlertEmail(
        {
          id: targetArticle.id,
          title: targetArticle.title,
          slug: targetArticle.slug,
          excerpt: targetArticle.excerpt,
          content: targetArticle.content,
          categoryName,
        },
        sub.token,
        baseUrl
      );

      const res = await sendEmail({
        to: sub.email,
        subject,
        html,
        text,
        emailType: "breaking_alert",
        metadata: {
          articleId: targetArticle.id,
          articleTitle: targetArticle.title,
          subscriberId: sub.id,
        },
      });

      if (res.success) sent++;
      else failed++;

      // Small throttling
      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    return NextResponse.json({
      success: true,
      message: `Breaking alert dispatched for "${targetArticle.title}". Sent: ${sent}, Failed: ${failed}.`,
      sent,
      failed,
      articleId: targetArticle.id,
    });
  } catch (error: any) {
    console.error("Breaking alert error:", error);
    return NextResponse.json(
      { error: "Failed to dispatch breaking alert", details: error.message },
      { status: 500 }
    );
  }
}
