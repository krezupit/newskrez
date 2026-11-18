"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Check, X, Clock, Archive, ExternalLink, Edit, Eye, Filter, Star } from "lucide-react";

interface ArticlesTableClientProps {
  initialArticles: any[];
  categories: any[];
  activeStatus: string;
}

export const ArticlesTableClient: React.FC<ArticlesTableClientProps> = ({
  initialArticles,
  categories,
  activeStatus,
}) => {
  const [articles, setArticles] = useState(initialArticles);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleStatusChange = async (articleId: number, newStatus: string) => {
    setUpdatingId(articleId);
    try {
      const res = await fetch("/api/admin/articles/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, status: newStatus }),
      });
      if (res.ok) {
        setArticles((prev) =>
          prev.map((a) => (a.id === articleId ? { ...a, status: newStatus } : a))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleFeatured = async (articleId: number, currentFeatured: boolean) => {
    setUpdatingId(articleId);
    try {
      const res = await fetch("/api/admin/articles/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, isFeatured: !currentFeatured }),
      });
      if (res.ok) {
        setArticles((prev) =>
          prev.map((a) => (a.id === articleId ? { ...a, isFeatured: !currentFeatured } : a))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const statuses = [
    { label: "All Articles", val: "all" },
    { label: "Published", val: "Published" },
    { label: "Pending Review", val: "Pending Review" },
    { label: "Draft", val: "Draft" },
    { label: "Archived", val: "Archived" },
  ];

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {statuses.map((s) => (
          <Link
            key={s.val}
            href={`/admin/articles${s.val === "all" ? "" : `?status=${encodeURIComponent(s.val)}`}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              activeStatus === s.val
                ? "bg-navy-900 text-white shadow-2xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[10px]">
              <tr>
                <th className="py-3 px-4">Headline & Source</th>
                <th className="py-3 px-4">Desk</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Views</th>
                <th className="py-3 px-4 text-right">Editorial Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {articles.map((art) => {
                const dateStr = art.publishedAt || art.createdAt;
                const formattedDate = dateStr
                  ? format(new Date(dateStr), "MMM dd, yyyy")
                  : "N/A";

                return (
                  <tr key={art.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="font-bold text-navy-900 line-clamp-1">
                        {art.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{art.source ? art.source.name : "NewsKrez Original"}</span>
                        {art.isBreaking && (
                          <span className="text-alertRed-600 font-bold uppercase">
                            • Breaking
                          </span>
                        )}
                        {art.isFeatured && (
                          <span className="text-brandTeal-600 font-bold uppercase">
                            • Featured
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {art.primaryCategory?.name || "General"}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          art.status === "Published"
                            ? "bg-emerald-100 text-emerald-800"
                            : art.status === "Pending Review"
                            ? "bg-amber-100 text-amber-800"
                            : art.status === "Draft"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {art.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">{formattedDate}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {art.viewsCount || 0}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleFeatured(art.id, Boolean(art.isFeatured))}
                          disabled={updatingId === art.id}
                          className={`p-1.5 rounded transition-colors ${
                            art.isFeatured
                              ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                              : "text-slate-300 hover:text-amber-500 hover:bg-slate-100"
                          }`}
                          title={art.isFeatured ? "Unfeature from Hero" : "Feature on General News Hero"}
                        >
                          <Star className={`w-3.5 h-3.5 ${art.isFeatured ? "fill-amber-500" : ""}`} />
                        </button>

                        {art.status !== "Published" ? (
                          <button
                            onClick={() => handleStatusChange(art.id, "Published")}
                            disabled={updatingId === art.id}
                            className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                            title="Approve & Publish"
                          >
                            <Check className="w-3 h-3" />
                            <span>Publish</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(art.id, "Archived")}
                            disabled={updatingId === art.id}
                            className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px] uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                            title="Archive"
                          >
                            <Archive className="w-3 h-3" />
                            <span>Archive</span>
                          </button>
                        )}

                        <Link
                          href={`/article/${art.slug}`}
                          target="_blank"
                          className="p-1 rounded text-slate-400 hover:text-navy-900 transition-colors"
                          title="Preview public page"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
