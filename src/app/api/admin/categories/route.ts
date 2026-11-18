import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateCategorySchema = z.object({
  categoryId: z.number(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
  name: z.string().optional(),
});

const createCategorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  parentId: z.number().nullable().optional(),
  description: z.string().optional(),
  displayOrder: z.number().default(1),
});

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const { categoryId, displayOrder, isActive, name } = parsed.data;

    const updates: any = {};
    if (typeof displayOrder === "number") updates.displayOrder = displayOrder;
    if (typeof isActive === "boolean") updates.isActive = isActive;
    if (typeof name === "string" && name.trim()) updates.name = name.trim();

    await db
      .update(schema.categories)
      .set(updates)
      .where(eq(schema.categories.id, categoryId));

    // Audit log
    await db.insert(schema.auditLogs).values({
      userId: user.userId,
      userEmail: user.email,
      action: "update_category",
      module: "categories",
      entityId: String(categoryId),
      details: JSON.stringify(updates),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid category data" }, { status: 400 });
    }

    const { name, slug, parentId, description, displayOrder } = parsed.data;

    // Check if slug already exists
    const existing = await db.query.categories.findFirst({
      where: eq(schema.categories.slug, slug.trim()),
    });

    if (existing) {
      return NextResponse.json(
        { error: "A category with this URL slug already exists." },
        { status: 400 }
      );
    }

    await db.insert(schema.categories).values({
      name: name.trim(),
      slug: slug.trim(),
      parentId: parentId || null,
      description: description || null,
      displayOrder: displayOrder || 1,
      isActive: true,
      isNav: true,
    });

    // Audit log
    await db.insert(schema.auditLogs).values({
      userId: user.userId,
      userEmail: user.email,
      action: "create_category",
      module: "categories",
      details: JSON.stringify({ name, slug, parentId }),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    if (!idParam) {
      return NextResponse.json({ error: "Missing category ID" }, { status: 400 });
    }

    const categoryId = parseInt(idParam, 10);

    // Remove subcategory
    await db.delete(schema.categories).where(eq(schema.categories.id, categoryId));

    // Audit log
    await db.insert(schema.auditLogs).values({
      userId: user.userId,
      userEmail: user.email,
      action: "delete_category",
      module: "categories",
      entityId: String(categoryId),
      details: JSON.stringify({ categoryId }),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
