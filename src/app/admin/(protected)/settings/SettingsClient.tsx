"use client";

import React, { useState } from "react";
import { Sliders, Save, CheckCircle2, LayoutList, Sparkles, Shield, ArrowUp, ArrowDown } from "lucide-react";

interface SettingItem {
  id: number;
  settingKey: string;
  settingValue: string;
  settingGroup: string;
  description: string | null;
}

interface SettingsClientProps {
  initialSettings: SettingItem[];
}

export const SettingsClient: React.FC<SettingsClientProps> = ({ initialSettings }) => {
  const [settings, setSettings] = useState(initialSettings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // 18 Homepage sections in default order
  const [sections, setSections] = useState([
    { id: 1, name: "Breaking News Ticker", order: 1, enabled: true, priority: "High" },
    { id: 2, name: "Header Advertisement Banner", order: 2, enabled: true, priority: "Standard" },
    { id: 3, name: "General News Featured Hero (Top Lead)", order: 3, enabled: true, priority: "Highest Priority 1", highlight: true },
    { id: 4, name: "Latest General News (Interactive Category Tabs)", order: 4, enabled: true, priority: "Highest Priority 1", highlight: true },
    { id: 5, name: "India News Desk", order: 5, enabled: true, priority: "High" },
    { id: 6, name: "World News Bureau", order: 6, enabled: true, priority: "High" },
    { id: 7, name: "Politics & Governance", order: 7, enabled: true, priority: "Standard" },
    { id: 8, name: "Business & Economy", order: 8, enabled: true, priority: "Standard" },
    { id: 9, name: "Sports Wire", order: 9, enabled: true, priority: "Standard" },
    { id: 10, name: "Entertainment & Culture", order: 10, enabled: true, priority: "Standard" },
    { id: 11, name: "Pharmaceutical & Biotech Desk", order: 11, enabled: true, priority: "Specialized" },
    { id: 12, name: "Medical Devices Intel (510k/PMA)", order: 12, enabled: true, priority: "Specialized" },
    { id: 13, name: "FDA News & Regulatory Warnings", order: 13, enabled: true, priority: "Specialized" },
    { id: 14, name: "WHO & Global Healthcare", order: 14, enabled: true, priority: "Specialized" },
    { id: 15, name: "Technology, AI & Cybersecurity", order: 15, enabled: true, priority: "Specialized" },
    { id: 16, name: "Regulatory Intelligence & Compliance", order: 16, enabled: true, priority: "Specialized" },
    { id: 17, name: "Trending News & Editor's Picks", order: 17, enabled: true, priority: "High" },
    { id: 18, name: "Newsletter Subscription Box", order: 18, enabled: true, priority: "Standard" },
  ]);

  const toggleSection = (id: number) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // re-index order
    const updated = newSections.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSections(updated);
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-navy-900">
            Portal Settings & Homepage Section Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure homepage section ordering, enable/disable modules, and adjust global parameters.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved Successfully</span>
          </div>
        )}
      </div>

      {/* 1. Homepage Section Order Configuration */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <LayoutList className="w-5 h-5 text-brandTeal-600" />
            <h2 className="font-serif font-bold text-base text-navy-950">
              Homepage Layout & Section Priority Order
            </h2>
          </div>
          <span className="text-xs font-bold text-brandTeal-600 bg-brandTeal-50 px-2.5 py-1 rounded-md">
            General News Default Priority #1
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Reorder sections or toggle their visibility on the live public homepage. General News hero and tabs receive highest visual prominence at the top.
        </p>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {sections.map((sec, idx) => (
            <div
              key={sec.id}
              className={`p-3.5 flex items-center justify-between text-xs transition-colors ${
                sec.highlight
                  ? "bg-amber-50/50"
                  : sec.enabled
                  ? "bg-white hover:bg-slate-50/80"
                  : "bg-slate-50 text-slate-400 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-navy-900 text-white font-bold flex items-center justify-center text-[11px]">
                  {sec.order}
                </span>
                <div>
                  <span className="font-bold text-navy-900 text-sm block">
                    {sec.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Priority Tier: {sec.priority}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center border border-slate-200 rounded-md bg-white">
                  <button
                    disabled={idx === 0}
                    onClick={() => moveSection(idx, "up")}
                    className="p-1 hover:bg-slate-100 disabled:opacity-30"
                    title="Move section up"
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-slate-700" />
                  </button>
                  <button
                    disabled={idx === sections.length - 1}
                    onClick={() => moveSection(idx, "down")}
                    className="p-1 hover:bg-slate-100 disabled:opacity-30"
                    title="Move section down"
                  >
                    <ArrowDown className="w-3.5 h-3.5 text-slate-700" />
                  </button>
                </div>

                <button
                  onClick={() => toggleSection(sec.id)}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-colors ${
                    sec.enabled
                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                      : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                  }`}
                >
                  {sec.enabled ? "Visible" : "Hidden"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Global Portal Configurations */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Sliders className="w-5 h-5 text-brandTeal-600" />
          <h2 className="font-serif font-bold text-base text-navy-950">
            Global Portal & Ingestion Parameters
          </h2>
        </div>

        <div className="space-y-4">
          {settings.map((s) => (
            <div key={s.id} className="space-y-1.5 pb-3 border-b border-slate-100 last:border-b-0">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-navy-900 font-mono">
                  {s.settingKey}
                </label>
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {s.settingGroup}
                </span>
              </div>
              {s.description && (
                <p className="text-[11px] text-slate-400">{s.description}</p>
              )}
              <input
                type="text"
                defaultValue={s.settingValue}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-brandTeal-500 font-medium"
              />
            </div>
          ))}
        </div>

        <div className="pt-2 text-right">
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-brandTeal-600 hover:bg-brandTeal-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save All Configurations</span>
          </button>
        </div>
      </div>
    </div>
  );
};
