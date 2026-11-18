import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { AlertOctagon, ShieldAlert, FileText, ExternalLink, ArrowRight } from "lucide-react";

export interface RegulatoryAlertItem {
  id: number;
  agency: string;
  alertType: string;
  title: string;
  slug: string;
  summary?: string | null;
  recallClass?: string | null;
  affectedProduct?: string | null;
  manufacturer?: string | null;
  alertDate: Date | string;
  sourceUrl?: string | null;
  status: string;
}

interface RegulatoryAlertsBannerProps {
  alerts: RegulatoryAlertItem[];
}

export const RegulatoryAlertsBanner: React.FC<RegulatoryAlertsBannerProps> = ({
  alerts = [],
}) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-slate-900 rounded-2xl p-5 md:p-6 text-white shadow-xl border border-slate-800">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-alertRed-600/20 text-alertRed-400 border border-alertRed-500/30">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-bold font-serif text-white">
                  Regulatory Recalls & Global Health Directives
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-alertRed-600 text-white uppercase">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official enforcement actions from FDA CDRH, WHO Outbreak Response, EMA & CDSCO
              </p>
            </div>
          </div>

          <Link
            href="/alerts"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brandTeal-400 hover:text-white transition-colors"
          >
            <span>View All Recalls & Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Alerts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {alerts.slice(0, 4).map((alert) => {
            const isClass1 = alert.recallClass?.includes("I") && !alert.recallClass?.includes("II");
            const alertDateStr = alert.alertDate
              ? format(new Date(alert.alertDate), "MMM dd, yyyy")
              : "";

            return (
              <div
                key={alert.id}
                className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 hover:border-brandTeal-500/50 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-700 text-brandTeal-300">
                      {alert.agency}
                    </span>
                    {alert.recallClass && (
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          isClass1
                            ? "bg-alertRed-600 text-white"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {alert.recallClass}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif font-bold text-sm text-slate-100 group-hover:text-brandTeal-300 transition-colors line-clamp-2 leading-snug">
                    <Link href={`/alerts/${alert.slug}`}>{alert.title}</Link>
                  </h3>

                  {alert.affectedProduct && (
                    <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-700/50">
                      <span className="text-slate-400 block text-[9px] uppercase font-semibold">
                        Affected Product:
                      </span>
                      <span className="line-clamp-1 font-medium text-slate-200">
                        {alert.affectedProduct}
                      </span>
                    </div>
                  )}

                  {alert.manufacturer && (
                    <div className="text-[11px] text-slate-400">
                      Firm: <span className="text-slate-300">{alert.manufacturer}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-[11px] text-slate-400">
                  <span>{alertDateStr}</span>
                  {alert.sourceUrl ? (
                    <a
                      href={alert.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brandTeal-400 hover:text-white inline-flex items-center gap-1"
                    >
                      Docket <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : (
                    <Link
                      href={`/alerts/${alert.slug}`}
                      className="text-brandTeal-400 hover:text-white"
                    >
                      Details →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
