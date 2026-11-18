"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FolderTree,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Radio,
  ExternalLink,
  Sparkles,
  AlertCircle,
} from "lucide-react";

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  displayOrder: number;
  isActive: boolean;
  description: string | null;
}

interface CategoriesManagerClientProps {
  initialParents: CategoryItem[];
  initialSubcategories: CategoryItem[];
}

export const CategoriesManagerClient: React.FC<CategoriesManagerClientProps> = ({
  initialParents,
  initialSubcategories,
}) => {
  const [parents, setParents] = useState<CategoryItem[]>(initialParents);
  const [subcategories, setSubcategories] = useState<CategoryItem[]>(initialSubcategories);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubName, setNewSubName] = useState("");
  const [newSubSlug, setNewSubSlug] = useState("");
  const [newSubDesc, setNewSubDesc] = useState("");
  const [newSubParentId, setNewSubParentId] = useState<number>(
    parents.find((p) => p.slug === "general-news")?.id || parents[0]?.id || 57
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group subcategories by parent ID
  const subMap = new Map<number, CategoryItem[]>();
  for (const s of subcategories) {
    if (s.parentId) {
      const list = subMap.get(s.parentId) || [];
      list.push(s);
      subMap.set(s.parentId, list);
    }
  }

  // Update Category Display Order
  const handleUpdateOrder = async (categoryId: number, newOrder: number) => {
    setLoadingId(categoryId);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, displayOrder: newOrder }),
      });
      if (res.ok) {
        setParents((prev) =>
          prev
            .map((c) => (c.id === categoryId ? { ...c, displayOrder: newOrder } : c))
            .sort((a, b) => a.displayOrder - b.displayOrder)
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  // Toggle Category Active State
  const handleToggleActive = async (categoryId: number, currentActive: boolean, isParent: boolean) => {
    setLoadingId(categoryId);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, isActive: !currentActive }),
      });
      if (res.ok) {
        if (isParent) {
          setParents((prev) =>
            prev.map((c) => (c.id === categoryId ? { ...c, isActive: !currentActive } : c))
          );
        } else {
          setSubcategories((prev) =>
            prev.map((c) => (c.id === categoryId ? { ...c, isActive: !currentActive } : c))
          );
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  // Delete Subcategory
  const handleDeleteSubcategory = async (categoryId: number) => {
    if (!confirm("Are you sure you want to delete this subcategory?")) return;
    setLoadingId(categoryId);
    try {
      const res = await fetch(`/api/admin/categories?id=${categoryId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSubcategories((prev) => prev.filter((c) => c.id !== categoryId));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  // Add New Subcategory
  const handleCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSubName,
          slug: newSubSlug,
          description: newSubDesc,
          parentId: newSubParentId,
          displayOrder: (subMap.get(newSubParentId)?.length || 0) + 1,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setShowAddModal(false);
        setNewSubName("");
        setNewSubSlug("");
        setNewSubDesc("");
        // Reload page to rehydrate cleanly
        window.location.reload();
      } else {
        setErrorMsg(data.error || "Failed to create category");
      }
    } catch (err: any) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-navy-900">
            Category Priority & Subcategory CMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure homepage display priority, manage General News desks, toggle active sections, and link RSS sources.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brandTeal-600 hover:bg-brandTeal-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subcategory</span>
        </button>
      </div>

      {/* Parent Category Priorities Grid */}
      <div className="grid grid-cols-1 gap-6">
        {parents.map((cat, index) => {
          const subs = subMap.get(cat.id) || [];
          const isGeneral = cat.slug === "general-news";

          return (
            <div
              key={cat.id}
              className={`bg-white rounded-2xl border transition-all p-6 shadow-sm space-y-5 ${
                isGeneral
                  ? "border-amber-400 ring-2 ring-amber-400/20 bg-gradient-to-r from-amber-50/20 via-white to-white"
                  : "border-slate-200"
              }`}
            >
              {/* Category Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-navy-900 text-white flex items-center justify-center font-bold text-xs">
                    #{cat.displayOrder}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-black text-lg text-navy-950">
                        {cat.name}
                      </h3>
                      {isGeneral && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          Default Priority 1 (Primary Desk)
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs text-slate-400">
                      /category/{cat.slug}
                    </span>
                  </div>
                </div>

                {/* Priority Controls & Active Toggle */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                    <button
                      title="Move Priority Up"
                      disabled={index === 0 || loadingId === cat.id}
                      onClick={() => handleUpdateOrder(cat.id, cat.displayOrder - 1)}
                      className="p-1.5 hover:bg-slate-200 text-slate-700 disabled:opacity-30 transition-colors"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 text-xs font-bold text-navy-900 font-mono">
                      {cat.displayOrder}
                    </span>
                    <button
                      title="Move Priority Down"
                      disabled={index === parents.length - 1 || loadingId === cat.id}
                      onClick={() => handleUpdateOrder(cat.id, cat.displayOrder + 1)}
                      className="p-1.5 hover:bg-slate-200 text-slate-700 disabled:opacity-30 transition-colors"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleToggleActive(cat.id, cat.isActive, true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      cat.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {cat.isActive ? "Active Desk" : "Disabled"}
                  </button>

                  <Link
                    href={`/category/${cat.slug}`}
                    target="_blank"
                    className="p-2 text-slate-400 hover:text-navy-900 transition-colors"
                    title="View Live Category Page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Subcategories Shelf */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Subcategories & Topics ({subs.length})
                  </span>
                  <Link
                    href="/admin/sources"
                    className="text-xs font-bold text-brandTeal-600 hover:text-brandTeal-700 flex items-center gap-1"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Manage Category Sources</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {subs.map((sub) => (
                    <div
                      key={sub.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                        sub.isActive
                          ? "bg-slate-50/80 border-slate-200 text-navy-900"
                          : "bg-slate-100/50 border-slate-200 text-slate-400 line-through"
                      }`}
                    >
                      <div className="truncate mr-2">
                        <span className="font-bold block truncate">{sub.name}</span>
                        <span className="font-mono text-[10px] text-slate-400 block truncate">
                          /{sub.slug}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleToggleActive(sub.id, sub.isActive, false)}
                          title={sub.isActive ? "Disable Subcategory" : "Enable Subcategory"}
                          className={`p-1 rounded ${
                            sub.isActive
                              ? "text-emerald-600 hover:bg-emerald-50"
                              : "text-slate-400 hover:bg-slate-200"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubcategory(sub.id)}
                          title="Remove Subcategory"
                          className="p-1 rounded text-alertRed-500 hover:bg-alertRed-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Subcategory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-black text-lg text-navy-950">
                Add Subcategory
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-navy-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-alertRed-50 border border-alertRed-200 text-alertRed-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubcategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Parent Category
                </label>
                <select
                  value={newSubParentId}
                  onChange={(e) => setNewSubParentId(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-navy-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brandTeal-500"
                >
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.slug === "general-news" ? "(General News)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Subcategory Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence Ethics"
                  value={newSubName}
                  onChange={(e) => {
                    setNewSubName(e.target.value);
                    if (!newSubSlug) {
                      setNewSubSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)+/g, "")
                      );
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brandTeal-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ai-ethics"
                  value={newSubSlug}
                  onChange={(e) => setNewSubSlug(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brandTeal-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description for SEO and listing headers..."
                  value={newSubDesc}
                  onChange={(e) => setNewSubDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brandTeal-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-brandTeal-600 hover:bg-brandTeal-500 text-white font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Create Subcategory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
