import React from "react";
import { db, schema } from "@/db";
import { desc } from "drizzle-orm";
import { format } from "date-fns";
import { AlertOctagon, ExternalLink } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminAlertsManagementPage() {
  const alerts = await db.query.regulatoryAlerts.findMany({
    orderBy: [desc(schema.regulatoryAlerts.alertDate)],
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-navy-900">
            FDA & WHO Regulatory Alerts Curation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Reviewing Class I, II, III recall actions, warning letters, and global outbreak communications.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[10px]">
              <tr>
                <th className="py-3 px-4">Headline & Firm</th>
                <th className="py-3 px-4">Agency</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Alert Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alerts.map((alt) => {
                const dateStr = alt.alertDate
                  ? format(new Date(alt.alertDate), "MMM dd, yyyy")
                  : "N/A";
                const isClass1 = alt.recallClass?.includes("I") && !alt.recallClass?.includes("II");

                return (
                  <tr key={alt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="font-bold text-navy-900 line-clamp-1">
                        {alt.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Firm: {alt.manufacturer || "Refer to dossier"} • {alt.externalReferenceId || ""}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-navy-900">{alt.agency}</td>
                    <td className="py-3.5 px-4">
                      {alt.recallClass ? (
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            isClass1
                              ? "bg-alertRed-600 text-white"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {alt.recallClass}
                        </span>
                      ) : (
                        <span className="text-slate-400 capitalize">{alt.alertType}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{dateStr}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {alt.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/alerts/${alt.slug}`}
                        target="_blank"
                        className="text-brandTeal-600 hover:text-brandTeal-800 font-bold text-xs"
                      >
                        Inspect →
                      </Link>
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
}
