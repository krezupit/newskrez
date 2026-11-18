import React from "react";
import { db, schema } from "@/db";
import { desc, eq, and } from "drizzle-orm";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { format } from "date-fns";
import {
  AlertOctagon,
  ShieldAlert,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";

interface AlertsPageProps {
  searchParams: {
    agency?: string;
    type?: string;
    q?: string;
  };
}

export const dynamic = "force-dynamic";

export default async function AlertsPage({ searchParams }: AlertsPageProps) {
  const currentUser = await getCurrentUser();
  const agencyFilter = searchParams.agency || "all";
  const typeFilter = searchParams.type || "all";
  const query = searchParams.q || "";

  // Fetch nav categories
  const navCategories = await db.query.categories.findMany({
    where: and(eq(schema.categories.isActive, true), eq(schema.categories.isNav, true)),
    orderBy: [schema.categories.displayOrder],
    limit: 10,
  });

  // Fetch all alerts
  const allAlerts = await db.query.regulatoryAlerts.findMany({
    orderBy: [desc(schema.regulatoryAlerts.alertDate)],
    limit: 60,
  });

  const filteredAlerts = allAlerts.filter((a) => {
    if (agencyFilter !== "all" && a.agency !== agencyFilter) return false;
    if (typeFilter !== "all" && a.alertType !== typeFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchProduct = a.affectedProduct?.toLowerCase().includes(q);
      const matchFirm = a.manufacturer?.toLowerCase().includes(q);
      if (!matchTitle && !matchProduct && !matchFirm) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header categories={navCategories} user={currentUser} />

      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-10 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-alertRed-600/20 text-alertRed-400 text-xs font-bold uppercase tracking-wider border border-alertRed-500/30">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Active Enforcement Sentinel</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-serif font-black text-white">
            FDA Recalls, WHO Directives & Safety Communications
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Direct feed of pharmaceutical and medical device recall actions, outbreak advisories, and enforcement dockets issued by the U.S. FDA, WHO, EMA, and CDSCO.
          </p>
        </div>
      </section>

      {/* Filters & Results */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <form method="GET" className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search affected product, manufacturer, recall number..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-brandTeal-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <select
              name="agency"
              defaultValue={agencyFilter}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-brandTeal-500"
            >
              <option value="all">All Agencies</option>
              <option value="FDA">U.S. FDA</option>
              <option value="WHO">WHO</option>
              <option value="EMA">EMA</option>
              <option value="CDSCO">CDSCO (India)</option>
            </select>

            <select
              name="type"
              defaultValue={typeFilter}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-brandTeal-500"
            >
              <option value="all">All Alert Types</option>
              <option value="recall">Product Recalls</option>
              <option value="safety_communication">Safety Communications</option>
              <option value="guidance">Guidance & Policy</option>
              <option value="outbreak">Disease Outbreaks</option>
            </select>

            <button
              type="submit"
              className="px-6 py-2 bg-navy-900 hover:bg-brandTeal-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
            >
              Apply Filter
            </button>
          </form>
        </div>

        {/* Alerts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlerts.map((alert) => {
            const isClass1 = alert.recallClass?.includes("I") && !alert.recallClass?.includes("II");
            const dateStr = alert.alertDate ? format(new Date(alert.alertDate), "MMMM dd, yyyy") : "";

            return (
              <div
                key={alert.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-brandTeal-500 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {alert.agency}
                    </span>
                    {alert.recallClass && (
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          isClass1
                            ? "bg-alertRed-600 text-white"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {alert.recallClass}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif font-bold text-base text-navy-900 leading-snug line-clamp-2">
                    <Link href={`/alerts/${alert.slug}`}>{alert.title}</Link>
                  </h3>

                  {alert.affectedProduct && (
                    <div className="p-2 bg-slate-50 rounded border border-slate-100 text-xs text-slate-700">
                      <span className="font-bold text-slate-500 block text-[10px] uppercase">
                        Product:
                      </span>
                      <p className="line-clamp-2">{alert.affectedProduct}</p>
                    </div>
                  )}

                  {alert.summary && (
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {alert.summary}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{dateStr}</span>
                  {alert.sourceUrl ? (
                    <a
                      href={alert.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brandTeal-600 hover:text-brandTeal-800 font-bold inline-flex items-center gap-1"
                    >
                      Docket <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <Link
                      href={`/alerts/${alert.slug}`}
                      className="text-brandTeal-600 hover:text-brandTeal-800 font-bold"
                    >
                      Details →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
