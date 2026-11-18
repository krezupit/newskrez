import React from "react";
import { db, schema } from "@/db";
import { desc } from "drizzle-orm";
import { Megaphone, ExternalLink, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAdsPage() {
  const ads = await db.query.advertisements.findMany({
    orderBy: [desc(schema.advertisements.createdAt)],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-navy-900">
            Advertisement & Sponsor Banner Placements
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage Google AdSense responsive slots, header leaderboards, and sponsored editorial features.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[10px]">
              <tr>
                <th className="py-3 px-4">Campaign Title</th>
                <th className="py-3 px-4">Placement</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4">Sponsor / Partner</th>
                <th className="py-3 px-4">Impressions</th>
                <th className="py-3 px-4">Clicks</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ads.map((ad) => (
                <tr key={ad.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-navy-900">{ad.title}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-brandTeal-700 font-semibold">
                    {ad.placement}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 uppercase text-[10px] font-bold">
                    {ad.adType}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    {ad.sponsorName || "Google AdSense"}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {ad.impressions}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {ad.clicks}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
