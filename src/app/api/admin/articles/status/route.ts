import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const statusSchema = z.object({
  articleId: z.number(),
  status: z.enum(["Draft", "Pending Review", "Approved", "Published", "Rejected", "Archived"]).optional(),
  isFeatured: z.boolean().optional(),
  isBreaking: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status parameters" }, { status: 400 });
    }

    const { articleId, status, isFeatured, isBreaking } = parsed.data;

    const updateData: any = {
      reviewerId: user.userId,
    };

    if (status) {
      updateData.status = status;
      if (status === "Published") {
        updateData.publishedAt = new Date();
      }
    }

    if (typeof isFeatured === "boolean") {
      updateData.isFeatured = isFeatured;
    }

    if (typeof isBreaking === "boolean") {
      updateData.isBreaking = isBreaking;
    }

    await db.update(schema.articles).set(updateData).where(eq(schema.articles.id, articleId));

    // Audit log
    await db.insert(schema.auditLogs).values({
      userId: user.userId,
      userEmail: user.email,
      action: status ? `status_change_to_${status.toLowerCase()}` : "toggle_feature_state",
      module: "articles",
      entityId: String(articleId),
      details: JSON.stringify({ updateData, timestamp: new Date().toISOString() }),
    });

    return NextResponse.json({ success: true, ...updateData });
  } catch (error: any) {
    console.error("Article status update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update article status" },
      { status: 500 }
    );
  }
}
