import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, schema } from "@/db";
import slugify from "slugify";
import crypto from "crypto";
import { z } from "zod";

const articleCreateSchema = z.object({
  title: z.string().min(5),
  slug: z.string().optional(),
  primaryCategoryId: z.number(),
  excerpt: z.string().optional(),
  content: z.string().min(20),
  featuredImage: z.string().optional(),
  imageCaption: z.string().optional(),
  status: z.enum(["Draft", "Pending Review", "Approved", "Published"]).default("Published"),
  isBreaking: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isEditorPick: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = articleCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    const data = parsed.data;
    const baseSlug = data.slug || slugify(data.title, { lower: true, strict: true, trim: true });
    const rand = crypto.randomBytes(3).toString("hex");
    const finalSlug = `${baseSlug.slice(0, 80)}-${rand}`;

    const [inserted] = await db.insert(schema.articles).values({
      title: data.title,
      slug: finalSlug,
      excerpt: data.excerpt || data.title,
      content: data.content,
      featuredImage: data.featuredImage || "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1000&auto=format&fit=crop&q=80",
      imageCaption: data.imageCaption,
      status: data.status,
      authorId: user.userId,
      primaryCategoryId: data.primaryCategoryId,
      seoTitle: `${data.title.slice(0, 60)} | NewsKrez`,
      metaDescription: (data.excerpt || data.title).slice(0, 160),
      isBreaking: data.isBreaking,
      isFeatured: data.isFeatured,
      isEditorPick: data.isEditorPick,
      publishedAt: data.status === "Published" ? new Date() : null,
      readingTimeMinutes: Math.max(2, Math.ceil(data.content.split(/\s+/).length / 200)),
    });

    // Record audit log
    await db.insert(schema.auditLogs).values({
      userId: user.userId,
      userEmail: user.email,
      action: "create_article",
      module: "articles",
      entityId: String(inserted.insertId),
      details: JSON.stringify({ title: data.title, status: data.status }),
    });

    return NextResponse.json({ success: true, articleId: inserted.insertId, slug: finalSlug });
  } catch (err: any) {
    console.error("Article create error:", err);
    return NextResponse.json({ error: err.message || "Failed to create article" }, { status: 500 });
  }
}
