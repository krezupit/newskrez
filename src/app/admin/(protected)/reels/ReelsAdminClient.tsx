"use client";

import React, { useState } from "react";
import { ReelItem, ReelSourceItem } from "@/lib/reels/types";
import {
  Film,
  Sparkles,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Plus,
  RefreshCw,
  ExternalLink,
  Trash2,
  Check,
  X,
  Radio,
  Sliders,
  Settings2,
  FileText,
  History,
  Layers,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface ReelsAdminClientProps {
  initialReels: ReelItem[];
  initialSources: ReelSourceItem[];
  initialLogs: any[];
  articles: any[];
  metrics: {
    total: number;
    published: number;
    pending: number;
    totalViews: number;
    activeSources: number;
  };
}

export const ReelsAdminClient: React.FC<ReelsAdminClientProps> = ({
  initialReels,
  initialSources,
  initialLogs,
  articles,
  metrics,
}) => {
  const [reels, setReels] = useState<ReelItem[]>(initialReels);
  const [sources, setSources] = useState<ReelSourceItem[]>(initialSources);
  const [logs, setLogs] = useState<any[]>(initialLogs);
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "sources" | "studio" | "logs" | "settings"
  >("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [previewReel, setPreviewReel] = useState<ReelItem | null>(null);

  // Ingestion loading state
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestMessage, setIngestMessage] = useState<string | null>(null);

  // Manual Reel Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [manualCategory, setManualCategory] = useState("general-news");
  const [manualStatus, setManualStatus] = useState("Published");
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Add Source Modal state
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceCode, setNewSourceCode] = useState("");
  const [newSourceChannelId, setNewSourceChannelId] = useState("");
  const [newSourceCategory, setNewSourceCategory] = useState("general-news");
  const [newSourceApproval, setNewSourceApproval] = useState(false);

  // AI Studio generation state
  const [selectedArticleId, setSelectedArticleId] = useState<number | "">("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [generatedScriptPreview, setGeneratedScriptPreview] = useState<any>(null);

  // Mode Setting state
  const [publishingMode, setPublishingMode] = useState<"both" | "embeds_only" | "ai_only">("both");

  // Refresh data from API
  const refreshReelsData = async () => {
    try {
      const res = await fetch("/api/admin/reels");
      const data = await res.json();
      if (data.success) {
        setReels(data.reels);
        setSources(data.sources);
        setLogs(data.logs);
      }
    } catch (_) {}
  };

  // Trigger manual ingestion
  const handleTriggerIngestion = async (sourceId?: number) => {
    setIsIngesting(true);
    setIngestMessage(null);
    try {
      const res = await fetch("/api/admin/reels/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "fetch_now", sourceId }),
      });
      const data = await res.json();
      if (data.success) {
        setIngestMessage(
          `Ingestion complete: Found ${data.result.reelsFound}, imported ${data.result.reelsImported} new reels.`
        );
        await refreshReelsData();
      } else {
        setIngestMessage(`Error: ${data.error || "Failed to run ingestion"}`);
      }
    } catch (err: any) {
      setIngestMessage(`Network error during ingestion: ${err.message}`);
    } finally {
      setIsIngesting(false);
    }
  };

  // Update reel status (Approve, Reject, Publish, Archive)
  const handleUpdateStatus = async (reelId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/reels/${reelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setReels((prev) =>
          prev.map((r) => (r.id === reelId ? { ...r, status: newStatus as any } : r))
        );
      }
    } catch (_) {}
  };

  // Delete reel
  const handleDeleteReel = async (reelId: number) => {
    if (!confirm("Are you sure you want to permanently delete this reel?")) return;
    try {
      const res = await fetch(`/api/admin/reels/${reelId}`, { method: "DELETE" });
      if (res.ok) {
        setReels((prev) => prev.filter((r) => r.id !== reelId));
        if (previewReel?.id === reelId) setPreviewReel(null);
      }
    } catch (_) {}
  };

  // Toggle Source
  const handleToggleSource = async (sourceId: number) => {
    try {
      const res = await fetch("/api/admin/reels/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", sourceId }),
      });
      const data = await res.json();
      if (data.success) {
        setSources((prev) =>
          prev.map((s) => (s.id === sourceId ? { ...s, isEnabled: data.isEnabled } : s))
        );
      }
    } catch (_) {}
  };

  // Create manual reel
  const handleCreateManualReel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingManual(true);
    try {
      const res = await fetch("/api/admin/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: manualTitle,
          videoUrl: manualUrl,
          videoType: "youtube",
          categorySlug: manualCategory,
          status: manualStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        setManualTitle("");
        setManualUrl("");
        await refreshReelsData();
      } else {
        alert(data.error || "Failed to create reel");
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Add new source
  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/reels/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSourceName,
          code: newSourceCode,
          channelId: newSourceChannelId,
          defaultCategorySlug: newSourceCategory,
          requiresEditorialApproval: newSourceApproval,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddSourceModalOpen(false);
        setNewSourceName("");
        setNewSourceCode("");
        setNewSourceChannelId("");
        await refreshReelsData();
      } else {
        alert(data.error || "Failed to add source");
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // Generate AI Reel
  const handleGenerateAiReel = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch("/api/admin/reels/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: selectedArticleId || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedScriptPreview(data.script);
        await refreshReelsData();
        alert(`AI Reel generated successfully! Status: ${data.status}`);
      } else {
        alert(data.error || "Failed to generate AI reel");
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const filteredReels = reels.filter((r) => {
    if (activeTab === "pending" && r.status !== "Pending Review") return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (categoryFilter !== "all" && r.categorySlug !== categoryFilter) return false;
    if (publishingMode === "embeds_only" && r.videoType === "ai_generated") return false;
    if (publishingMode === "ai_only" && r.videoType !== "ai_generated") return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Film className="w-6 h-6 text-brandTeal-600" />
            <h1 className="text-xl sm:text-2xl font-serif font-black text-navy-900">
              News Reels Control Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brandTeal-100 text-brandTeal-800 font-bold text-xs">
              9:16 Video Engine
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Manage automated YouTube news discovery, verified editorial shorts, and AI article-to-video generation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/reels"
            target="_blank"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-navy-900 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors border border-slate-300"
          >
            <span>Live Feed</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => handleTriggerIngestion()}
            disabled={isIngesting}
            className="px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isIngesting ? "animate-spin" : ""}`} />
            <span>{isIngesting ? "Discovering..." : "Discover Reels Now"}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-brandTeal-600 hover:bg-brandTeal-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manual Reel</span>
          </button>
        </div>
      </div>

      {/* Ingestion notification message */}
      {ingestMessage && (
        <div className="p-4 bg-brandTeal-50 border border-brandTeal-300 text-brandTeal-900 rounded-xl text-xs font-medium flex items-center justify-between">
          <span>{ingestMessage}</span>
          <button onClick={() => setIngestMessage(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 5 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Reels
          </span>
          <span className="text-2xl font-black text-navy-900 mt-1 block">
            {metrics.total}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
            Published Live
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {metrics.published}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
            Pending Review
          </span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">
            {metrics.pending}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-brandTeal-600 uppercase tracking-wider block">
            Total Views
          </span>
          <span className="text-2xl font-black text-brandTeal-600 mt-1 block">
            {metrics.totalViews}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
            Active Sources
          </span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">
            {metrics.activeSources}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "all"
              ? "bg-navy-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          All Reels ({reels.length})
        </button>

        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "pending"
              ? "bg-amber-600 text-white shadow-xs"
              : "text-amber-800 bg-amber-50 hover:bg-amber-100"
          }`}
        >
          <span>Pending Review</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black">
            {metrics.pending}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("sources")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "sources"
              ? "bg-navy-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          Sources & Limits ({sources.length})
        </button>

        <button
          onClick={() => setActiveTab("studio")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "studio"
              ? "bg-brandTeal-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Article-to-Reels Studio</span>
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "logs"
              ? "bg-navy-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          Import Logs
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "settings"
              ? "bg-navy-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          Module Settings
        </button>
      </div>

      {/* TAB 1: ALL REELS & TAB 2: PENDING REVIEW */}
      {(activeTab === "all" || activeTab === "pending") && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold text-slate-500">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-navy-900 bg-slate-50"
              >
                <option value="all">All Statuses</option>
                <option value="Published">Published</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>

              <span className="text-xs font-bold text-slate-500 ml-2">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-navy-900 bg-slate-50"
              >
                <option value="all">All Categories</option>
                <option value="general-news">General News</option>
                <option value="india-news">India News</option>
                <option value="world-news">World News</option>
                <option value="business-economy">Business</option>
                <option value="technology">Technology</option>
                <option value="who-healthcare">WHO & Healthcare</option>
                <option value="fda-news">FDA News</option>
                <option value="medical-devices">Medical Devices</option>
                <option value="pharmaceutical">Pharmaceutical</option>
                <option value="regulatory-intelligence">Regulatory Intel</option>
              </select>
            </div>

            <span className="text-xs text-slate-400 font-semibold">
              Showing {filteredReels.length} reels
            </span>
          </div>

          {/* Reels Table / Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="p-3.5">Reel</th>
                    <th className="p-3.5">Source & Channel</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Views</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredReels.map((reel) => (
                    <tr key={reel.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => setPreviewReel(reel)}
                            className="relative w-12 h-16 rounded-lg bg-navy-900 overflow-hidden shrink-0 cursor-pointer group shadow-2xs"
                          >
                            <img
                              src={reel.thumbnailUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=100&h=150&fit=crop"}
                              alt={reel.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="w-4 h-4 text-white fill-white" />
                            </div>
                          </div>
                          <div className="max-w-md">
                            <span
                              onClick={() => setPreviewReel(reel)}
                              className="font-bold text-navy-900 hover:text-brandTeal-600 cursor-pointer line-clamp-2"
                            >
                              {reel.title}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">
                              {reel.videoType === "ai_generated" ? "✨ AI Generated Reel" : "YouTube Embed"} • {reel.rightsStatus}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold text-slate-700 block">
                          {reel.channelTitle || reel.sourceName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(reel.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                          {reel.categoryName || reel.categorySlug}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                            reel.status === "Published"
                              ? "bg-emerald-100 text-emerald-800"
                              : reel.status === "Pending Review"
                              ? "bg-amber-100 text-amber-800 font-black animate-pulse"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {reel.status}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-slate-700">
                          {reel.viewsCount}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewReel(reel)}
                            className="p-1.5 text-slate-500 hover:text-brandTeal-600 hover:bg-slate-100 rounded-lg"
                            title="Preview Video"
                          >
                            <Play className="w-4 h-4" />
                          </button>

                          {reel.status !== "Published" ? (
                            <button
                              onClick={() => handleUpdateStatus(reel.id, "Published")}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold shadow-2xs"
                              title="Approve and Publish"
                            >
                              Approve
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(reel.id, "Archived")}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[11px] font-bold"
                              title="Archive Reel"
                            >
                              Archive
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteReel(reel.id)}
                            className="p-1.5 text-slate-400 hover:text-alertRed-600 hover:bg-alertRed-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredReels.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400">
                        No reels match your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SOURCES MANAGEMENT */}
      {activeTab === "sources" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-navy-900">
                Official Video Channels & Permitted RSS Sources
              </h2>
              <p className="text-xs text-slate-500">
                Configure YouTube channel IDs and daily quotas for automated vertical reels discovery.
              </p>
            </div>
            <button
              onClick={() => setIsAddSourceModalOpen(true)}
              className="px-4 py-2 bg-brandTeal-600 hover:bg-brandTeal-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Verified Source</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map((src) => (
              <div
                key={src.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-navy-900">{src.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {src.channelId || src.code}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleSource(src.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                      src.isEnabled
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {src.isEnabled ? "Enabled" : "Disabled"}
                  </button>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Default Category:</span>
                    <strong className="text-navy-900">{src.defaultCategorySlug}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Limit:</span>
                    <strong className="text-navy-900">
                      {src.publishedToday} / {src.dailyPublishLimit} today
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Editorial Review:</span>
                    <strong
                      className={
                        src.requiresEditorialApproval ? "text-amber-600" : "text-emerald-600"
                      }
                    >
                      {src.requiresEditorialApproval ? "Required (Health/FDA)" : "Auto-Approved"}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Imported:</span>
                    <strong className="text-navy-900">{src.totalReelsImported}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {src.lastFetchedAt
                      ? `Last: ${new Date(src.lastFetchedAt).toLocaleTimeString()}`
                      : "Never fetched"}
                  </span>
                  <button
                    onClick={() => handleTriggerIngestion(src.id)}
                    disabled={isIngesting}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-brandTeal-50 hover:text-brandTeal-700 text-slate-700 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    Fetch Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ARTICLE-TO-REELS AI STUDIO */}
      {activeTab === "studio" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-navy-900">
                Article-to-Reels AI Generation Pipeline
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Transform published NewsKrez articles into original 20–45 second vertical video scripts
              with 9:16 visual cards, synthesized speech narration, and full regulatory attribution.
            </p>
          </div>

          <div className="max-w-xl space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Select Approved News Article
              </label>
              <select
                value={selectedArticleId}
                onChange={(e) => setSelectedArticleId(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-slate-300 text-xs text-navy-900 bg-slate-50 font-medium"
              >
                <option value="">Latest Published News Article (Auto-Select)</option>
                {articles.map((art) => (
                  <option key={art.id} value={art.id}>
                    #{art.id} - {art.title.slice(0, 80)}...
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerateAiReel}
              disabled={isGeneratingAi}
              className="w-full py-3.5 bg-brandTeal-600 hover:bg-brandTeal-500 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isGeneratingAi ? "Generating 9:16 AI Reel..." : "Generate Vertical AI Reel"}</span>
            </button>
          </div>

          {generatedScriptPreview && (
            <div className="p-5 bg-navy-950 text-white rounded-2xl border border-navy-800 space-y-4">
              <div className="flex items-center justify-between border-b border-navy-800 pb-2">
                <span className="font-bold text-sm text-brandTeal-400">
                  Generated Reel Script & Scene Breakdown
                </span>
                <span className="text-xs text-slate-400">
                  Duration: ~{generatedScriptPreview.suggestedDurationSeconds}s
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div>
                  <strong className="text-white block mb-0.5">Headline & Hook:</strong>
                  <p className="bg-navy-900 p-2.5 rounded-lg border border-navy-800">
                    {generatedScriptPreview.hook}
                  </p>
                </div>

                <div>
                  <strong className="text-white block mb-0.5">Narration Voice Lines:</strong>
                  <ul className="space-y-1 list-disc list-inside bg-navy-900 p-2.5 rounded-lg border border-navy-800">
                    {generatedScriptPreview.narrationLines.map((line: string, i: number) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <strong className="text-white block mb-0.5">Source Attribution:</strong>
                  <p className="text-brandTeal-300">{generatedScriptPreview.sourceAttribution}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: IMPORT LOGS */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-base font-bold text-navy-900">Reels Discovery & Ingestion Logs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3.5">Source</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Found</th>
                  <th className="p-3.5">Imported</th>
                  <th className="p-3.5">Skipped</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="p-3.5 font-bold text-navy-900">{log.sourceName || "System Cron"}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          log.status === "success"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-alertRed-100 text-alertRed-800"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">{log.reelsFound}</td>
                    <td className="p-3.5 font-bold text-emerald-600">{log.reelsImported}</td>
                    <td className="p-3.5 text-slate-400">{log.reelsSkipped}</td>
                    <td className="p-3.5 text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: SETTINGS */}
      {activeTab === "settings" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6 max-w-2xl">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-navy-900">Reels Publishing Strategy</h2>
            <p className="text-xs text-slate-500">
              Configure allowed content types for the public vertical video feed.
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="radio"
                name="publishingMode"
                value="both"
                checked={publishingMode === "both"}
                onChange={() => setPublishingMode("both")}
                className="text-brandTeal-600 focus:ring-brandTeal-500"
              />
              <div>
                <strong className="block text-xs font-bold text-navy-900">
                  Both Authorized Video Embeds & Original AI Reels (Recommended)
                </strong>
                <span className="text-[11px] text-slate-500">
                  Mix authorized YouTube official publisher shorts with original NewsKrez AI dossier reels.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="radio"
                name="publishingMode"
                value="embeds_only"
                checked={publishingMode === "embeds_only"}
                onChange={() => setPublishingMode("embeds_only")}
                className="text-brandTeal-600 focus:ring-brandTeal-500"
              />
              <div>
                <strong className="block text-xs font-bold text-navy-900">
                  Authorized Video Embeds Only
                </strong>
                <span className="text-[11px] text-slate-500">
                  Only show permitted YouTube shorts and news video feeds.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="radio"
                name="publishingMode"
                value="ai_only"
                checked={publishingMode === "ai_only"}
                onChange={() => setPublishingMode("ai_only")}
                className="text-brandTeal-600 focus:ring-brandTeal-500"
              />
              <div>
                <strong className="block text-xs font-bold text-navy-900">
                  Original AI-Generated Reels Only
                </strong>
                <span className="text-[11px] text-slate-500">
                  Only show original vertical reels created from approved NewsKrez articles.
                </span>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* VIDEO PREVIEW MODAL */}
      {previewReel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm h-[80vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col">
            <button
              onClick={() => setPreviewReel(null)}
              className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>

            {previewReel.externalId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${previewReel.externalId}?autoplay=1&mute=0&controls=1&playsinline=1`}
                title={previewReel.title}
                className="w-full h-full object-cover"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <div className="w-full h-full flex flex-col justify-center p-6 bg-navy-950 text-white text-center space-y-4">
                <span className="px-3 py-1 rounded-full bg-brandTeal-600 text-xs font-bold mx-auto">
                  Original AI Reel
                </span>
                <h3 className="font-serif font-black text-lg">{previewReel.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {previewReel.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MANUAL REEL CREATION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-navy-900">Add Manual News Reel</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualReel} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reel Title
                </label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  required
                  placeholder="e.g. WHO updates surveillance guidelines on avian influenza"
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs text-navy-900 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  YouTube Shorts / Video URL
                </label>
                <input
                  type="url"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  required
                  placeholder="https://www.youtube.com/shorts/VIDEO_ID or watch URL"
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs text-navy-900 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs text-navy-900 bg-slate-50"
                  >
                    <option value="general-news">General News</option>
                    <option value="india-news">India News</option>
                    <option value="world-news">World News</option>
                    <option value="business-economy">Business</option>
                    <option value="technology">Technology</option>
                    <option value="who-healthcare">WHO & Healthcare</option>
                    <option value="fda-news">FDA News</option>
                    <option value="medical-devices">Medical Devices</option>
                    <option value="pharmaceutical">Pharmaceutical</option>
                    <option value="regulatory-intelligence">Regulatory Intel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={manualStatus}
                    onChange={(e) => setManualStatus(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs text-navy-900 bg-slate-50"
                  >
                    <option value="Published">Published</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingManual}
                  className="px-6 py-2.5 rounded-xl bg-brandTeal-600 hover:bg-brandTeal-500 text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {isSubmittingManual ? "Saving..." : "Save & Publish Reel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SOURCE MODAL */}
      {isAddSourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-navy-900">Add YouTube Video Source</h3>
              <button
                onClick={() => setIsAddSourceModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSource} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Source / Publisher Name
                </label>
                <input
                  type="text"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  required
                  placeholder="e.g. Associated Press"
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs text-navy-900 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Source Code
                  </label>
                  <input
                    type="text"
                    value={newSourceCode}
                    onChange={(e) => setNewSourceCode(e.target.value)}
                    required
                    placeholder="e.g. ap-news"
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs text-navy-900 bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    YouTube Channel ID
                  </label>
                  <input
                    type="text"
                    value={newSourceChannelId}
                    onChange={(e) => setNewSourceChannelId(e.target.value)}
                    required
                    placeholder="e.g. UCxxxxxxxx"
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs text-navy-900 bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Default Category
                </label>
                <select
                  value={newSourceCategory}
                  onChange={(e) => setNewSourceCategory(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs text-navy-900 bg-slate-50"
                >
                  <option value="general-news">General News</option>
                  <option value="india-news">India News</option>
                  <option value="world-news">World News</option>
                  <option value="business-economy">Business</option>
                  <option value="technology">Technology</option>
                  <option value="who-healthcare">WHO & Healthcare</option>
                  <option value="fda-news">FDA News</option>
                  <option value="medical-devices">Medical Devices</option>
                  <option value="pharmaceutical">Pharmaceutical</option>
                  <option value="regulatory-intelligence">Regulatory Intel</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newSourceApproval}
                  onChange={(e) => setNewSourceApproval(e.target.checked)}
                  className="rounded text-brandTeal-600 focus:ring-brandTeal-500"
                />
                <span>Requires Editorial Approval (Mandatory for Medical/FDA)</span>
              </label>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddSourceModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brandTeal-600 hover:bg-brandTeal-500 text-white text-xs font-bold shadow-md"
                >
                  Save Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
