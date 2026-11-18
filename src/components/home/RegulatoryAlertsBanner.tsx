import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { AlertOctagon, ExternalLink, ArrowRight } from "lucide-react";

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
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-2xl border border-slate-800">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-alertRed-600/20 text-alertRed-400 border border-alertRed-500/30">
              <AlertOctagon className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl md:text-2xl font-black font-serif text-white">
                  Regulatory Recalls & Global Health Directives
                </h2>
                <span className="px-2.5 py-0.5 rounded text-xs font-black bg-alertRed-600 text-white uppercase tracking-wider">
                  LIVE
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-0.5">
                Official enforcement actions from FDA CDRH, WHO Outbreak Response, EMA & CDSCO
              </p>
            </div>
          </div>

          <Link
            href="/alerts"
            className="inline-flex items-center gap-2 text-sm font-bold text-brandTeal-300 hover:text-white transition-colors"
          >
            <span>View All Recalls & Alerts</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Alerts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
          {alerts.slice(0, 4).map((alert) => {
            const isClass1 = alert.recallClass?.includes("I") && !alert.recallClass?.includes("II");
            const alertDateStr = alert.alertDate
              ? format(new Date(alert.alertDate), "MMM dd, yyyy")
              : "";

            return (
              <div
                key={alert.id}
                className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 hover:border-brandTeal-400 transition-all flex flex-col justify-between space-y-3.5 group shadow-sm"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded bg-slate-700 text-brandTeal-300">
                      {alert.agency}
                    </span>
                    {alert.recallClass && (
                      <span
                        className={`text-xs font-black uppercase px-2.5 py-0.5 rounded ${
                          isClass1
                            ? "bg-alertRed-600 text-white"
                            : "bg-amber-500/25 text-amber-300 border border-amber-500/40"
                        }`}
                      >
                        {alert.recallClass}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif font-black text-base text-slate-100 group-hover:text-brandTeal-300 transition-colors line-clamp-2 leading-snug">
                    <Link href={`/alerts/${alert.slug}`}>{alert.title}</Link>
                  </h3>

                  {alert.affectedProduct && (
                    <div className="text-xs text-slate-200 bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 space-y-0.5">
                      <span className="text-slate-400 block text-xs uppercase font-bold">
                        Affected Product:
                      </span>
                      <span className="line-clamp-2 font-medium text-slate-100 text-xs">
                        {alert.affectedProduct}
                      </span>
                    </div>
                  )}

                  {alert.manufacturer && (
                    <div className="text-xs text-slate-300 font-medium">
                      Firm: <span className="text-white font-bold">{alert.manufacturer}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-700/80 text-xs text-slate-400 font-semibold">
                  <span>{alertDateStr}</span>
                  {alert.sourceUrl ? (
                    <a
                      href={alert.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brandTeal-300 hover:text-white inline-flex items-center gap-1 font-bold"
                    >
                      Docket <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <Link
                      href={`/alerts/${alert.slug}`}
                      className="text-brandTeal-300 hover:text-white font-bold"
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
