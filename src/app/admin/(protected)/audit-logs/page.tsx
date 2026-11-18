import React from "react";
import { db, schema } from "@/db";
import { desc } from "drizzle-orm";
import { format } from "date-fns";
import { History, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  const logs = await db.query.auditLogs.findMany({
    orderBy: [desc(schema.auditLogs.createdAt)],
    limit: 60,
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-serif font-black text-navy-900">
          Editorial Audit Trail & Security Logs
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete non-repudiation log tracking all editorial logins, article creations, status transitions, and config changes.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => {
                const dateStr = log.createdAt
                  ? format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")
                  : "";

                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {dateStr}
                    </td>
                    <td className="py-3 px-4 font-bold text-navy-900">
                      {log.userEmail || "System"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-600 uppercase text-[10px]">
                      {log.module}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[10px] max-w-xs truncate">
                      {log.details || "-"}
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
