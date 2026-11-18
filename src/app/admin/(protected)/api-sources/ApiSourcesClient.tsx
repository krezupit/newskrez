"use client";

import React, { useState } from "react";
import { ProviderStatusInfo, ProviderCode } from "@/lib/news-providers/types";
import {
  Globe,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Play,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Database,
  Sliders,
  Check,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

interface LogEntry {
  id: number;
  providerCode: string;
  categorySlug: string | null;
  status: string;
  httpStatus: number | null;
  articlesFetched: number;
  articlesInserted: number;
  articlesSkipped: number;
  errorMessage: string | null;
  executionTimeMs: number;
  fetchedAt: string;
}

interface ApiSourcesClientProps {
  initialProviders: ProviderStatusInfo[];
  initialLogs: LogEntry[];
}

const CATEGORIES = [
  { slug: "general-news", label: "General News (Default)" },
  { slug: "india-news", label: "India News" },
  { slug: "world-news", label: "World News" },
  { slug: "politics", label: "Politics" },
  { slug: "business-economy", label: "Business & Economy" },
  { slug: "sports", label: "Sports" },
  { slug: "entertainment", label: "Entertainment" },
  { slug: "pharmaceutical", label: "Pharmaceutical" },
  { slug: "medical-devices", label: "Medical Devices" },
  { slug: "fda-news", label: "FDA News" },
  { slug: "who-healthcare", label: "WHO & Healthcare" },
  { slug: "technology", label: "Technology" },
];

export const ApiSourcesClient: React.FC<ApiSourcesClientProps> = ({
  initialProviders,
  initialLogs,
}) => {
  const [providers, setProviders] = useState<ProviderStatusInfo[]>(initialProviders);
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const showToast = (type: "success" | "error" | "info", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const refreshData = async () => {
    try {
      const res = await fetch("/api/admin/api-sources");
      const data = await res.json();
      if (data.success) {
        setProviders(data.providers);
        setLogs(
          data.recentLogs.map((l: any) => ({
            ...l,
            fetchedAt: l.fetchedAt,
          }))
        );
      }
    } catch (err) {
      console.error("Refresh error:", err);
    }
  };

  const handleToggle = async (providerCode: ProviderCode, currentEnabled: boolean) => {
    setActionLoading(`toggle-${providerCode}`);
    try {
      const res = await fetch("/api/admin/api-sources", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerCode,
          isEnabled: !currentEnabled,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("success", `Provider '${providerCode}' ${!currentEnabled ? "enabled" : "disabled"}.`);
        await refreshData();
      } else {
        showToast("error", data.error || "Failed to update status.");
      }
    } catch (err: any) {
      showToast("error", err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleTestConnection = async (providerCode: ProviderCode) => {
    setActionLoading(`test-${providerCode}`);
    try {
      const res = await fetch("/api/admin/api-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          providerCode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          "success",
          `✓ ${providerCode.toUpperCase()}: Connection healthy! Response time: ${data.executionTimeMs}ms, ${data.articlesCount} articles validated.`
        );
      } else {
        showToast("error", `✗ ${providerCode.toUpperCase()} test failed: ${data.errorMessage || "Unknown error"}`);
      }
      await refreshData();
    } catch (err: any) {
      showToast("error", `Network error testing ${providerCode}: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleFetchNow = async (providerCode: ProviderCode) => {
    const category = selectedCategory[providerCode] || "general-news";
    setActionLoading(`fetch-${providerCode}`);
    try {
      const res = await fetch("/api/admin/api-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "fetch",
          providerCode,
          categorySlug: category,
          autoPublish: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          "success",
          `✓ Ingested from ${providerCode.toUpperCase()}: ${data.articlesInserted} new articles saved (${data.articlesSkipped} duplicates skipped).`
        );
      } else {
        showToast("error", `Ingestion error: ${data.errorMessage || "Failed to fetch"}`);
      }
      await refreshData();
    } catch (err: any) {
      showToast("error", `Fetch failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-semibold transition-all ${
            toastMessage.type === "success"
              ? "bg-brandTeal-800 text-white border border-brandTeal-500"
              : toastMessage.type === "error"
              ? "bg-alertRed-800 text-white border border-alertRed-500"
              : "bg-navy-900 text-white border border-navy-700"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-brandTeal-300 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-alertRed-300 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Legal & Commercial Compliance Advisory */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-2xl shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Commercial & Google AdSense Policy Compliance</span>
        </div>
        <p className="text-sm text-amber-800 leading-relaxed">
          NewsKrez maintains strict publisher attribution, canonical URL backlinks, and original wire credit.
          Note that <strong>NewsAPI.org Free Tier</strong> is strictly restricted to non-commercial and development environments.
          If your portal runs Google AdSense in commercial production, keep NewsAPI.org toggled <strong>OFF</strong> or upgrade to NewsAPI.org Business.
          <strong> GNews, Currents, Mediastack, and NewsData.io</strong> support publisher-attributed indexing with canonical source links.
        </p>
      </div>

      {/* Provider Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {providers.map((provider) => {
          const isLoading = actionLoading?.includes(provider.code);
          const currentCategory = selectedCategory[provider.code] || "general-news";

          return (
            <div
              key={provider.code}
              className={`bg-white rounded-2xl border transition-all p-6 shadow-sm hover:shadow-md flex flex-col justify-between ${
                provider.isEnabled ? "border-slate-200" : "border-slate-200 bg-slate-50/70 opacity-80"
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-xl font-bold font-serif text-navy-950">
                        {provider.name}
                      </h3>
                      <a
                        href={provider.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-brandTeal-600 transition-colors"
                        title="Open official documentation"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                      Provider Code: {provider.code}
                    </span>
                  </div>

                  {/* Toggle button */}
                  <button
                    onClick={() => handleToggle(provider.code, provider.isEnabled)}
                    disabled={isLoading}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      provider.isEnabled ? "bg-brandTeal-600" : "bg-slate-300"
                    }`}
                    title={provider.isEnabled ? "Click to disable provider" : "Click to enable provider"}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        provider.isEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  {provider.isConfigured ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Check className="w-3.5 h-3.5" /> Key Configured
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-alertRed-50 text-alertRed-700 border border-alertRed-200">
                      <XCircle className="w-3.5 h-3.5" /> Missing API Key
                    </span>
                  )}

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      provider.lastStatus === "success"
                        ? "bg-brandTeal-50 text-brandTeal-700 border-brandTeal-200"
                        : provider.lastStatus === "error"
                        ? "bg-alertRed-50 text-alertRed-700 border-alertRed-200"
                        : "bg-slate-100 text-slate-700 border-slate-300"
                    }`}
                  >
                    {provider.lastStatus === "success" ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : provider.lastStatus === "error" ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    Status: {provider.lastStatus.toUpperCase()}
                  </span>

                  {provider.code === "newsapi" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                      Non-Commercial Only
                    </span>
                  )}
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-5">
                  <div>
                    <div className="text-slate-500 font-medium">Masked Credential</div>
                    <div className="font-mono font-bold text-navy-900 mt-0.5">
                      {provider.maskedKey}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 font-medium">Articles Imported</div>
                    <div className="font-bold text-navy-900 mt-0.5 flex items-center gap-1">
                      <Database className="w-3.5 h-3.5 text-brandTeal-600" />
                      <span>{provider.quotaUsedToday > 0 ? provider.quotaUsedToday * 10 : 0} articles</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 font-medium">Quota Remaining</div>
                    <div className="font-bold text-navy-900 mt-0.5">
                      {provider.quotaRemaining !== null
                        ? `${provider.quotaRemaining} calls left`
                        : "Tracking Daily (100 req/d)"}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 font-medium">Last Synchronized</div>
                    <div className="font-medium text-slate-700 mt-0.5">
                      {provider.lastFetchAt
                        ? format(new Date(provider.lastFetchAt), "MMM dd, HH:mm")
                        : "Never"}
                    </div>
                  </div>
                </div>

                {/* Error message banner if last fetch errored */}
                {provider.lastErrorMessage && (
                  <div className="mb-4 p-3 bg-alertRed-50 border border-alertRed-200 rounded-xl text-xs text-alertRed-700 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-alertRed-600 shrink-0 mt-0.5" />
                    <span className="break-all">{provider.lastErrorMessage}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <select
                    value={currentCategory}
                    onChange={(e) =>
                      setSelectedCategory((prev) => ({
                        ...prev,
                        [provider.code]: e.target.value,
                      }))
                    }
                    className="flex-1 text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium text-navy-900 focus:outline-none focus:ring-1 focus:ring-brandTeal-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleFetchNow(provider.code)}
                    disabled={isLoading || !provider.isEnabled}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Fetch Now</span>
                  </button>
                </div>

                <button
                  onClick={() => handleTestConnection(provider.code)}
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-navy-900 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 border border-slate-200"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  <span>Test Connection</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ingestion Audit Trail Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-serif text-navy-950">
              Live Ingestion Audit Logs
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time records of external API gateway transactions, response statuses, and article import stats.
            </p>
          </div>
          <button
            onClick={refreshData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Fetched</th>
                <th className="py-3 px-4 text-center">Inserted</th>
                <th className="py-3 px-4 text-center">Skipped</th>
                <th className="py-3 px-4 text-right">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No ingestion logs recorded yet. Click "Fetch Now" or "Test Connection" to generate live logs.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {format(new Date(log.fetchedAt), "yyyy-MM-dd HH:mm:ss")}
                    </td>
                    <td className="py-3 px-4 font-bold text-navy-950 uppercase">
                      {log.providerCode}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {log.categorySlug || "general-news"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                          log.status === "success"
                            ? "bg-brandTeal-50 text-brandTeal-800 border border-brandTeal-200"
                            : "bg-alertRed-50 text-alertRed-800 border border-alertRed-200"
                        }`}
                      >
                        {log.status} ({log.httpStatus || 200})
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-navy-900">
                      {log.articlesFetched}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-brandTeal-700">
                      +{log.articlesInserted}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500">
                      {log.articlesSkipped}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {log.executionTimeMs}ms
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
