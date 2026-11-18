import React from "react";
import { db, schema } from "@/db";
import { count, eq, desc } from "drizzle-orm";
import Link from "next/link";
import { format } from "date-fns";
import {
  FileText,
  Clock,
  CheckCircle,
  Radio,
  AlertTriangle,
  Activity,
  Users,
  Play,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Aggregate real database counts
  const totalArticlesRes = await db.select({ count: count() }).from(schema.articles);
  const publishedArticlesRes = await db
    .select({ count: count() })
    .from(schema.articles)
    .where(eq(schema.articles.status, "Published"));
  const pendingArticlesRes = await db
    .select({ count: count() })
    .from(schema.articles)
    .where(eq(schema.articles.status, "Pending Review"));

  const totalSourcesRes = await db.select({ count: count() }).from(schema.sources);
  const activeSourcesRes = await db
    .select({ count: count() })
    .from(schema.sources)
    .where(eq(schema.sources.isActive, true));

  const totalDevicesRes = await db.select({ count: count() }).from(schema.medicalDevices);
  const totalAlertsRes = await db.select({ count: count() }).from(schema.regulatoryAlerts);
  const totalSubscribersRes = await db
    .select({ count: count() })
    .from(schema.newsletterSubscribers);

  // Fetch categories & sources for quick lookup
  const allCategories = await db.query.categories.findMany();
  const catMap = new Map(allCategories.map((c) => [c.id, c.name]));

  const sourcesList = await db.query.sources.findMany();
  const sourceNameMap = new Map(sourcesList.map((s) => [s.id, s.name]));

  // Recent articles without lateral join
  const recentArticlesRaw = await db.query.articles.findMany({
    orderBy: [desc(schema.articles.createdAt)],
    limit: 6,
  });

  const recentArticles = recentArticlesRaw.map((a) => ({
    ...a,
    categoryName: catMap.get(a.primaryCategoryId) || "General",
    sourceName: a.sourceId ? sourceNameMap.get(a.sourceId) : "NewsKrez Original",
  }));

  // Recent Ingestion logs
  const recentLogs = await db.query.fetchLogs.findMany({
    orderBy: [desc(schema.fetchLogs.fetchedAt)],
    limit: 6,
  });

  const metrics = [
    {
      label: "Total Articles",
      value: totalArticlesRes[0]?.count || 0,
      icon: FileText,
      color: "text-navy-900 bg-navy-100",
    },
    {
      label: "Published Articles",
      value: publishedArticlesRes[0]?.count || 0,
      icon: CheckCircle,
      color: "text-emerald-700 bg-emerald-100",
    },
    {
      label: "Pending Editorial Review",
      value: pendingArticlesRes[0]?.count || 0,
      icon: Clock,
      color: "text-amber-700 bg-amber-100",
    },
    {
      label: "Active Ingestion Sources",
      value: `${activeSourcesRes[0]?.count || 0} / ${totalSourcesRes[0]?.count || 0}`,
      icon: Radio,
      color: "text-brandTeal-700 bg-brandTeal-100",
    },
    {
      label: "Medical Devices Tracked",
      value: totalDevicesRes[0]?.count || 0,
      icon: Activity,
      color: "text-indigo-700 bg-indigo-100",
    },
    {
      label: "FDA/WHO Regulatory Alerts",
      value: totalAlertsRes[0]?.count || 0,
      icon: AlertTriangle,
      color: "text-alertRed-700 bg-red-100",
    },
    {
      label: "Newsletter Subscribers",
      value: totalSubscribersRes[0]?.count || 0,
      icon: Users,
      color: "text-blue-700 bg-blue-100",
    },
    {
      label: "Cron Ingestion Frequency",
      value: "60 Min",
      icon: TrendingUp,
      color: "text-purple-700 bg-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome & Manual Run Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-navy-900">
            NewsKrez Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated intelligence synchronization, editorial review pipeline, and Hostinger cron status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/sources"
            className="px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-brandTeal-600 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Manage Ingestion Feeds</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5"
            >
              <div className={`p-3 rounded-xl ${m.color} shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block truncate">
                  {m.label}
                </span>
                <span className="text-xl font-serif font-black text-navy-900">
                  {m.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Recent Articles & Fetch Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Articles Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-serif font-bold text-sm text-navy-900 uppercase tracking-wider">
              Recent News & Intelligence Stream
            </h2>
            <Link
              href="/admin/articles"
              className="text-xs font-bold text-brandTeal-600 hover:text-brandTeal-700 inline-flex items-center gap-1"
            >
              <span>View All Articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentArticles.map((art) => (
              <div
                key={art.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors gap-3"
              >
                <div className="flex-1 truncate">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        art.status === "Published"
                          ? "bg-emerald-100 text-emerald-800"
                          : art.status === "Pending Review"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {art.status}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {art.categoryName}
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs text-navy-900 truncate">
                    {art.title}
                  </h4>
                </div>

                <div className="text-right shrink-0">
                  <Link
                    href={`/article/${art.slug}`}
                    target="_blank"
                    className="text-xs font-bold text-brandTeal-600 hover:underline"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Fetch Logs (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-serif font-bold text-sm text-navy-900 uppercase tracking-wider">
              Automated Ingestion Logs
            </h2>
            <Link
              href="/admin/sources"
              className="text-xs font-bold text-brandTeal-600 hover:text-brandTeal-700 inline-flex items-center gap-1"
            >
              <span>Sources</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentLogs.map((log) => {
              const srcName = sourceNameMap.get(log.sourceId) || `Source #${log.sourceId}`;
              const timeStr = log.fetchedAt
                ? format(new Date(log.fetchedAt), "HH:mm:ss")
                : "";

              return (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg border border-slate-100 text-xs flex items-center justify-between bg-slate-50/50"
                >
                  <div className="truncate pr-2">
                    <span className="font-semibold text-navy-900 block truncate">
                      {srcName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Fetched: {log.recordsFetched} • Inserted: {log.recordsInserted} • Skipped: {log.recordsSkipped}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        log.status === "success"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {log.status}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                      {timeStr}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
