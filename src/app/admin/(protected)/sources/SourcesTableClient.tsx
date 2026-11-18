"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  Play,
  RotateCw,
  CheckCircle,
  AlertCircle,
  Radio,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface SourcesTableClientProps {
  initialSources: any[];
  initialLogs: any[];
}

export const SourcesTableClient: React.FC<SourcesTableClientProps> = ({
  initialSources,
  initialLogs,
}) => {
  const [sources, setSources] = useState(initialSources);
  const [logs, setLogs] = useState(initialLogs);
  const [loadingCode, setLoadingCode] = useState<string | null>(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleFetch = async (sourceCode?: string) => {
    if (sourceCode) {
      setLoadingCode(sourceCode);
    } else {
      setGlobalLoading(true);
    }
    setMessage(null);

    try {
      const res = await fetch("/api/admin/sources/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceCode }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(
          sourceCode
            ? `Successfully triggered ingestion for [${sourceCode}].`
            : "Global synchronization executed successfully across all active sources."
        );
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setMessage(`Network error: ${e.message}`);
    } finally {
      setLoadingCode(null);
      setGlobalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center justify-between">
          <span>{message}</span>
          <button
            onClick={() => setMessage(null)}
            className="text-teal-700 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Global Sync Action Bar */}
      <div className="bg-navy-950 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-navy-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brandTeal-400 font-bold text-xs uppercase tracking-wider">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Master Ingestion Trigger</span>
          </div>
          <p className="text-xs text-slate-300">
            Executes scheduled fetch sequence across all configured openFDA endpoints and RSS feeds immediately.
          </p>
        </div>

        <button
          onClick={() => handleFetch()}
          disabled={globalLoading}
          className="px-5 py-2.5 rounded-xl bg-brandTeal-600 hover:bg-brandTeal-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 disabled:opacity-50 shrink-0"
        >
          <RotateCw className={`w-4 h-4 ${globalLoading ? "animate-spin" : ""}`} />
          <span>{globalLoading ? "Synchronizing Feeds..." : "Run All Feeds Now"}</span>
        </button>
      </div>

      {/* Sources Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-serif font-bold text-sm text-navy-900">
            Configured Ingestion Connectors ({sources.length})
          </h2>
          <span className="text-xs text-slate-500">Auto-Deduplicating via SHA-256</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[10px]">
              <tr>
                <th className="py-3 px-4">Source Connector</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Interval</th>
                <th className="py-3 px-4">Last Status</th>
                <th className="py-3 px-4">Last Synced</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sources.map((src) => {
                const isLoading = loadingCode === src.code;
                const dateStr = src.lastFetchedAt
                  ? format(new Date(src.lastFetchedAt), "MMM dd, HH:mm:ss")
                  : "Never";

                return (
                  <tr key={src.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-navy-900">{src.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {src.code}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {src.type}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {src.fetchIntervalMinutes} min
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          src.lastStatus === "success"
                            ? "bg-emerald-100 text-emerald-800"
                            : src.lastStatus === "error"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {src.lastStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{dateStr}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleFetch(src.code)}
                        disabled={isLoading || globalLoading}
                        className="px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-brandTeal-600 text-white font-bold text-[10px] uppercase tracking-wider transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                      >
                        <RotateCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                        <span>{isLoading ? "Fetching..." : "Fetch Now"}</span>
                      </button>
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
