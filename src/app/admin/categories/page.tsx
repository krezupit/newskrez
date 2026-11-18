import React from "react";
import { db, schema } from "@/db";
import { isNull, isNotNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const parentCategories = await db.query.categories.findMany({
    where: isNull(schema.categories.parentId),
    orderBy: [schema.categories.displayOrder],
  });

  const allSubcategories = await db.query.categories.findMany({
    where: isNotNull(schema.categories.parentId),
  });

  const subMap = new Map<number, any[]>();
  for (const s of allSubcategories) {
    if (s.parentId) {
      const existing = subMap.get(s.parentId) || [];
      existing.push(s);
      subMap.set(s.parentId, existing);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-navy-900">
            News Desks, Categories & Subcategories
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hierarchical structure powering NewsKrez navigation, article categorization, and SEO paths.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {parentCategories.map((cat) => {
          const subs = subMap.get(cat.id) || [];
          return (
            <div
              key={cat.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brandTeal-600" />
                  <h3 className="font-serif font-bold text-base text-navy-900">
                    {cat.name}
                  </h3>
                </div>
                <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  /{cat.slug}
                </span>
              </div>

              {cat.description && (
                <p className="text-xs text-slate-500 leading-relaxed">
                  {cat.description}
                </p>
              )}

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Active Subcategories ({subs.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {subs.map((sub) => (
                    <span
                      key={sub.id}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200"
                    >
                      {sub.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
