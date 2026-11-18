import React from "react";
import { db, schema } from "@/db";
import { desc } from "drizzle-orm";
import { format } from "date-fns";
import { Mail, CheckCircle, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage() {
  const subscribers = await db.query.newsletterSubscribers.findMany({
    orderBy: [desc(schema.newsletterSubscribers.createdAt)],
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-navy-900">
            Newsletter Subscribers & Intelligence Dispatch List
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered subscribers receiving FDA recalls, drug approvals, and regulatory digests.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-serif font-bold text-sm text-navy-900">
            Subscribers ({subscribers.length})
          </h2>
          <span className="text-xs text-slate-500">Verified Professional Deliveries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[10px]">
              <tr>
                <th className="py-3 px-4">Subscriber Email</th>
                <th className="py-3 px-4">Dispatch Frequency</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Subscribed Date</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subscribers.map((sub) => {
                const dateStr = sub.createdAt
                  ? format(new Date(sub.createdAt), "MMM dd, yyyy HH:mm")
                  : "N/A";

                return (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-navy-900">{sub.email}</td>
                    <td className="py-3 px-4 capitalize text-slate-600 font-medium">
                      {sub.frequency}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{dateStr}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {sub.isActive ? "Active" : "Unsubscribed"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No subscribers recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
