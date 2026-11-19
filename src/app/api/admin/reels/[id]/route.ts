import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reelId = parseInt(params.id, 10);
    if (isNaN(reelId)) {
      return NextResponse.json({ error: "Invalid reel ID" }, { status: 400 });
    }

    const body = await req.json();
    const updateData: any = {};

    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === "Published") {
        updateData.publishedAt = new Date();
      }
    }
    if (body.title !== undefined) updateData.title = body.title;
    if (body.categorySlug !== undefined) updateData.categorySlug = body.categorySlug;
    if (body.categoryName !== undefined) updateData.categoryName = body.categoryName;
    if (body.isFeatured !== undefined) updateData.isFeatured = Boolean(body.isFeatured);
    if (body.relatedArticleId !== undefined) updateData.relatedArticleId = body.relatedArticleId ? Number(body.relatedArticleId) : null;

    updateData.updatedAt = new Date();

    await db.update(schema.reels).set(updateData).where(eq(schema.reels.id, reelId));

    return NextResponse.json({ success: true, message: "Reel updated" });
  } catch (err: any) {
    console.error("Error updating reel:", err);
    return NextResponse.json({ error: err.message || "Failed to update reel" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reelId = parseInt(params.id, 10);
    if (isNaN(reelId)) {
      return NextResponse.json({ error: "Invalid reel ID" }, { status: 400 });
    }

    await db.delete(schema.reels).where(eq(schema.reels.id, reelId));

    return NextResponse.json({ success: true, message: "Reel deleted" });
  } catch (err: any) {
    console.error("Error deleting reel:", err);
    return NextResponse.json({ error: err.message || "Failed to delete reel" }, { status: 500 });
  }
}
