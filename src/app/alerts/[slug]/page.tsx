import React from "react";
import { db, schema } from "@/db";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { format } from "date-fns";
import {
  AlertOctagon,
  Building,
  Calendar,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Info,
} from "lucide-react";

interface AlertDetailPageProps {
  params: {
    slug: string;
  };
}

export default async function AlertDetailPage({ params }: AlertDetailPageProps) {
  const currentUser = await getCurrentUser();

  const alert = await db.query.regulatoryAlerts.findFirst({
    where: eq(schema.regulatoryAlerts.slug, params.slug),
  });

  if (!alert) {
    notFound();
  }

  const navCategories = await db.query.categories.findMany({
    where: and(eq(schema.categories.isActive, true), eq(schema.categories.isNav, true)),
    orderBy: [schema.categories.displayOrder],
    limit: 10,
  });

  const dateStr = alert.alertDate
    ? format(new Date(alert.alertDate), "MMMM dd, yyyy")
    : "Recently";

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header categories={navCategories} user={currentUser} />

      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <Link href="/" className="hover:text-brandTeal-600">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/alerts" className="hover:text-brandTeal-600">
            Recalls & Alerts
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 truncate max-w-xs">{alert.title}</span>
        </nav>

        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-slate-900 text-brandTeal-400 text-xs font-bold uppercase">
              {alert.agency} {alert.alertType.toUpperCase()}
            </span>
            {alert.recallClass && (
              <span className="px-2.5 py-1 rounded bg-alertRed-600 text-white text-xs font-black uppercase">
                {alert.recallClass}
              </span>
            )}
            <span className="text-xs text-slate-500 ml-auto flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {dateStr}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-black text-navy-900 leading-tight">
            {alert.title}
          </h1>

          {/* Key Facts Summary Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-500 block uppercase text-[10px]">
                Affected Product:
              </span>
              <span className="font-semibold text-navy-900 text-sm">
                {alert.affectedProduct || "Refer to dossier"}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block uppercase text-[10px]">
                Recalling Firm / Manufacturer:
              </span>
              <span className="font-semibold text-navy-900 text-sm">
                {alert.manufacturer || "Refer to dossier"}
              </span>
            </div>
            {alert.externalReferenceId && (
              <div>
                <span className="font-bold text-slate-500 block uppercase text-[10px]">
                  Reference / Recall Number:
                </span>
                <span className="font-mono text-navy-900 font-bold">
                  {alert.externalReferenceId}
                </span>
              </div>
            )}
            {alert.distributionPattern && (
              <div>
                <span className="font-bold text-slate-500 block uppercase text-[10px]">
                  Distribution Scope:
                </span>
                <span className="text-slate-700">{alert.distributionPattern}</span>
              </div>
            )}
          </div>

          {alert.summary && (
            <div className="text-slate-700 leading-relaxed text-sm bg-amber-50/50 p-4 rounded-xl border border-amber-200/60">
              <strong className="text-amber-900 block mb-1">Executive Summary:</strong>
              <p>{alert.summary}</p>
            </div>
          )}

          {alert.content && (
            <div
              className="article-prose pt-4"
              dangerouslySetInnerHTML={{ __html: alert.content }}
            />
          )}

          {alert.sourceUrl && (
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Official Regulatory Docket:</span>
              <a
                href={alert.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-brandTeal-600 hover:bg-brandTeal-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <span>Open Agency Docket</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
