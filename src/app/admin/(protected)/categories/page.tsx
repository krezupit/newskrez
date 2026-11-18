import React from "react";
import { db, schema } from "@/db";
import { isNull, isNotNull } from "drizzle-orm";
import { CategoriesManagerClient } from "./CategoriesManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const parentCategories = await db.query.categories.findMany({
    where: isNull(schema.categories.parentId),
    orderBy: [schema.categories.displayOrder],
  });

  const allSubcategories = await db.query.categories.findMany({
    where: isNotNull(schema.categories.parentId),
    orderBy: [schema.categories.displayOrder],
  });

  return (
    <CategoriesManagerClient
      initialParents={parentCategories}
      initialSubcategories={allSubcategories}
    />
  );
}
