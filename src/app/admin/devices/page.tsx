import React from "react";
import { db, schema } from "@/db";
import { desc } from "drizzle-orm";
import { format } from "date-fns";
import { Activity, ExternalLink, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDevicesPage() {
  const devices = await db.query.medicalDevices.findMany({
    orderBy: [desc(schema.medicalDevices.createdAt)],
    limit: 50,
  });

  const records = await db.query.medicalDeviceRegulatoryRecords.findMany({
    orderBy: [desc(schema.medicalDeviceRegulatoryRecords.decisionDate)],
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-navy-900">
            Medical Devices & Regulatory Dossier Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking CDRH 510(k) clearances, PMA premarket authorizations, and device classifications.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-serif font-bold text-sm text-navy-900">
            Medical Device Regulatory Records ({records.length})
          </h2>
          <span className="text-xs text-slate-500">Live Ingested from FDA CDRH</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[10px]">
              <tr>
                <th className="py-3 px-4">Device Name</th>
                <th className="py-3 px-4">Manufacturer</th>
                <th className="py-3 px-4">Submission #</th>
                <th className="py-3 px-4">Type & Class</th>
                <th className="py-3 px-4">Decision Date</th>
                <th className="py-3 px-4 text-right">Docket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((rec) => {
                const dateStr = rec.decisionDate
                  ? format(new Date(rec.decisionDate), "MMM dd, yyyy")
                  : "N/A";

                return (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-navy-900 max-w-xs truncate">
                      {rec.deviceName}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{rec.applicant}</td>
                    <td className="py-3 px-4 font-mono font-bold text-navy-900">
                      {rec.submissionNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-brandTeal-50 text-brandTeal-700 border border-brandTeal-200">
                        {rec.recordType} • {rec.deviceClass || "Class II"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{dateStr}</td>
                    <td className="py-3 px-4 text-right">
                      {rec.sourceUrl && (
                        <a
                          href={rec.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brandTeal-600 hover:text-brandTeal-800 font-bold inline-flex items-center gap-1"
                        >
                          CDRH Docket <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
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
