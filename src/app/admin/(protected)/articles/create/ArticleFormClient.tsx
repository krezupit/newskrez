"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Eye, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface ArticleFormClientProps {
  categories: any[];
}

export const ArticleFormClient: React.FC<ArticleFormClientProps> = ({ categories }) => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [primaryCategoryId, setPrimaryCategoryId] = useState<number>(categories[0]?.id || 1);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState(
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&auto=format&fit=crop&q=80"
  );
  const [imageCaption, setImageCaption] = useState("");
  const [status, setStatus] = useState<"Draft" | "Pending Review" | "Published">("Published");
  const [isBreaking, setIsBreaking] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isEditorPick, setIsEditorPick] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/articles/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          primaryCategoryId,
          excerpt,
          content,
          featuredImage,
          imageCaption,
          status,
          isBreaking,
          isFeatured,
          isEditorPick,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/admin/articles");
        router.refresh();
      } else {
        setError(data.error || "Failed to create article");
      }
    } catch (e: any) {
      setError(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-1.5">
          Article Headline *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. FDA Grants Priority Review for Novel Monoclonal Antibody in Alzheimer's Treatment"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-navy-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brandTeal-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Primary Category */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-1.5">
            Primary Desk / Category *
          </label>
          <select
            value={primaryCategoryId}
            onChange={(e) => setPrimaryCategoryId(Number(e.target.value))}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-brandTeal-500"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-1.5">
            Editorial Workflow Status
          </label>
          <select
            value={status}
            onChange={(e: any) => setStatus(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-brandTeal-500"
          >
            <option value="Published">Published (Public immediately)</option>
            <option value="Pending Review">Pending Review (Awaiting senior editor)</option>
            <option value="Draft">Draft (Internal draft)</option>
          </select>
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-1.5">
          Executive Summary / Lead Paragraph
        </label>
        <textarea
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Short concise summary appearing on news cards and search engine meta descriptions..."
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-brandTeal-500"
        />
      </div>

      {/* Featured Image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-1.5">
            Featured Image URL
          </label>
          <input
            type="url"
            value={featuredImage}
            onChange={(e) => setFeaturedImage(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-brandTeal-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-1.5">
            Image Caption & Attribution
          </label>
          <input
            type="text"
            value={imageCaption}
            onChange={(e) => setImageCaption(e.target.value)}
            placeholder="Clinical trials in biotechnology facility."
            className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-brandTeal-500"
          />
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-1.5">
          Article HTML Content & Analysis *
        </label>
        <textarea
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          placeholder="<p>Full article content formatted with paragraphs, <h2> sections, <ul> lists, or <blockquote> analysis...</p>"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brandTeal-500 leading-relaxed"
        />
      </div>

      {/* Placement Flags */}
      <div className="flex flex-wrap items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <label className="flex items-center gap-2 text-xs font-bold text-navy-900 cursor-pointer">
          <input
            type="checkbox"
            checked={isBreaking}
            onChange={(e) => setIsBreaking(e.target.checked)}
            className="w-4 h-4 text-alertRed-600 rounded focus:ring-alertRed-500"
          />
          <span className="text-alertRed-600">Mark as Breaking Alert (Ticker Display)</span>
        </label>

        <label className="flex items-center gap-2 text-xs font-bold text-navy-900 cursor-pointer">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-4 h-4 text-brandTeal-600 rounded focus:ring-brandTeal-500"
          />
          <span>Hero Featured Story</span>
        </label>

        <label className="flex items-center gap-2 text-xs font-bold text-navy-900 cursor-pointer">
          <input
            type="checkbox"
            checked={isEditorPick}
            onChange={(e) => setIsEditorPick(e.target.checked)}
            className="w-4 h-4 text-brandTeal-600 rounded focus:ring-brandTeal-500"
          />
          <span>Editor's Pick (Sidebar Highlight)</span>
        </label>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <Link
          href="/admin/articles"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cancel & Back</span>
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-brandTeal-600 hover:bg-brandTeal-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? "Saving Article..." : "Save Article"}</span>
        </button>
      </div>
    </form>
  );
};
