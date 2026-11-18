import React from "react";
import { db, schema } from "@/db";
import { Sliders, Save, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await db.query.websiteSettings.findMany();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-serif font-black text-navy-900">
          Website Settings & Regulatory Configurations
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Global portal branding, Google AdSense IDs, SEO descriptions, and ingestion parameters.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        {settings.map((s) => (
          <div key={s.id} className="space-y-1.5 pb-4 border-b border-slate-100 last:border-b-0">
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
              className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-brandTeal-500"
            />
          </div>
        ))}

        <div className="pt-2 text-right">
          <button
            type="button"
            className="px-6 py-2.5 rounded-xl bg-brandTeal-600 hover:bg-brandTeal-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
