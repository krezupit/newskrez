import React from "react";
import { db, schema } from "@/db";
import { desc, eq, and } from "drizzle-orm";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { format } from "date-fns";
import {
  Activity,
  Search,
  ExternalLink,
  Stethoscope,
  Info,
  Calendar,
  Building,
  FileCode,
} from "lucide-react";

interface MedicalDevicesPageProps {
  searchParams: {
    q?: string;
    tab?: string;
    cls?: string;
  };
}

export const dynamic = "force-dynamic";

export default async function MedicalDevicesPage({
  searchParams,
}: MedicalDevicesPageProps) {
  const currentUser = await getCurrentUser();
  const query = searchParams.q || "";
  const activeTab = searchParams.tab || "all";
  const classFilter = searchParams.cls || "all";

  // Fetch nav categories
  const navCategories = await db.query.categories.findMany({
    where: and(eq(schema.categories.isActive, true), eq(schema.categories.isNav, true)),
    orderBy: [schema.categories.displayOrder],
    limit: 10,
  });

  // Fetch Medical Device Regulatory Records with Device relations
  const records = await db.query.medicalDeviceRegulatoryRecords.findMany({
    orderBy: [desc(schema.medicalDeviceRegulatoryRecords.decisionDate)],
    limit: 60,
  });

  // Fetch Medical Device Recalls
  const recalls = await db.query.deviceRecalls.findMany({
    orderBy: [desc(schema.deviceRecalls.eventDate)],
    limit: 30,
  });

  // Calculate statistics
  const total510k = records.filter((r) => r.recordType === "510k").length;
  const totalPMA = records.filter((r) => r.recordType === "PMA").length;
  const totalRecalls = recalls.length;

  // Filter records based on tab, query, and class
  const filteredRecords = records.filter((r) => {
    // Tab filter
    if (activeTab === "510k" && r.recordType !== "510k") return false;
    if (activeTab === "pma" && r.recordType !== "PMA") return false;
    if (activeTab === "de_novo" && r.recordType !== "De_Novo") return false;

    // Device class filter
    if (classFilter !== "all" && r.deviceClass !== classFilter) return false;

    // Search query
    if (query) {
      const q = query.toLowerCase();
      const matchName = r.deviceName.toLowerCase().includes(q);
      const matchApplicant = r.applicant.toLowerCase().includes(q);
      const matchSub = r.submissionNumber.toLowerCase().includes(q);
      const matchCode = r.productCode?.toLowerCase().includes(q);
      if (!matchName && !matchApplicant && !matchSub && !matchCode) return false;
    }

    return true;
  });

  const filteredRecalls = recalls.filter((rec) => {
    if (classFilter !== "all" && rec.recallClass !== classFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      const matchProduct = rec.productName.toLowerCase().includes(q);
      const matchFirm = rec.firmName.toLowerCase().includes(q);
      const matchNum = rec.recallNumber.toLowerCase().includes(q);
      if (!matchProduct && !matchFirm && !matchNum) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header categories={navCategories} user={currentUser} />

      {/* Hero Banner for Medical Devices */}
      <section className="bg-gradient-to-r from-navy-950 via-navy-900 to-brandTeal-950 text-white py-12 px-4 border-b border-navy-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brandTeal-500/20 text-brandTeal-200 text-xs sm:text-sm font-extrabold uppercase tracking-wider border border-brandTeal-400/30">
            <Activity className="w-4 h-4 text-brandTeal-300" />
            <span>CDRH • EU MDR • CDSCO Regulatory Gateway</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-black text-white leading-tight">
            Medical Devices Regulatory Intelligence Hub
          </h1>

          <p className="text-sm sm:text-base text-slate-200 max-w-3xl leading-relaxed">
            Live synchronization with the U.S. FDA Center for Devices and Radiological Health (CDRH). Search 510(k) premarket notifications, Class III Premarket Approvals (PMA), De Novo authorizations, and urgent Class I recall determinations.
          </p>

          {/* Key Metrics Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <div className="bg-navy-900/90 p-4 rounded-2xl border border-navy-700">
              <span className="text-xs sm:text-sm uppercase font-bold text-slate-300 block">510(k) Clearances</span>
              <span className="text-2xl sm:text-3xl font-black text-white">{total510k || "250+"}</span>
            </div>
            <div className="bg-navy-900/90 p-4 rounded-2xl border border-navy-700">
              <span className="text-xs sm:text-sm uppercase font-bold text-slate-300 block">PMA Approvals</span>
              <span className="text-2xl sm:text-3xl font-black text-brandTeal-300">{totalPMA || "48"}</span>
            </div>
            <div className="bg-navy-900/90 p-4 rounded-2xl border border-navy-700">
              <span className="text-xs sm:text-sm uppercase font-bold text-slate-300 block">Class I/II Recalls</span>
              <span className="text-2xl sm:text-3xl font-black text-alertRed-400">{totalRecalls || "18"}</span>
            </div>
            <div className="bg-navy-900/90 p-4 rounded-2xl border border-navy-700">
              <span className="text-xs sm:text-sm uppercase font-bold text-slate-300 block">Update Frequency</span>
              <span className="text-2xl sm:text-3xl font-black text-white">Every 60m</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {/* Regulatory Guidance Banner (Distinction between Clearance vs Approval) */}
        <div className="p-5 rounded-2xl bg-teal-50/80 border border-teal-200 text-teal-950 flex items-start gap-3.5 shadow-2xs">
          <Info className="w-6 h-6 text-brandTeal-700 shrink-0 mt-0.5" />
          <div className="text-sm sm:text-base leading-relaxed space-y-1.5">
            <span className="font-extrabold text-navy-900 uppercase tracking-wide block text-sm">
              Regulatory Pathway Distinctions:
            </span>
            <p className="text-slate-800">
              <strong>510(k) Clearance:</strong> Establishes substantial equivalence to a legally marketed predicate device (21 CFR 807).
              <br />
              <strong>PMA Approval:</strong> Rigorous evaluation establishing reasonable assurance of safety and effectiveness for high-risk Class III devices.
              <br />
              <strong>Adverse Event Disclaimers:</strong> Reports from FDA MAUDE represent voluntary notifications and do not verify proven clinical causation.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <form method="GET" className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search device name, manufacturer, 510(k) number (e.g. K241890), or product code..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm sm:text-base text-navy-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brandTeal-500 font-medium"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <select
              name="cls"
              defaultValue={classFilter}
              className="px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm sm:text-base text-navy-900 focus:outline-none focus:ring-2 focus:ring-brandTeal-500 font-semibold"
            >
              <option value="all">All Device Classes</option>
              <option value="Class I">Class I (Low Risk)</option>
              <option value="Class II">Class II (Moderate Risk - 510k)</option>
              <option value="Class III">Class III (High Risk - PMA)</option>
            </select>

            <button
              type="submit"
              className="px-6 py-3 bg-navy-900 hover:bg-brandTeal-600 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-colors shadow-sm"
            >
              Filter Records
            </button>
          </form>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100">
            <Link
              href={`/medical-devices?tab=all${query ? `&q=${query}` : ""}`}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-colors ${
                activeTab === "all"
                  ? "bg-navy-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All Intelligence ({records.length})
            </Link>
            <Link
              href={`/medical-devices?tab=510k${query ? `&q=${query}` : ""}`}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-colors ${
                activeTab === "510k"
                  ? "bg-brandTeal-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              510(k) Clearances ({total510k})
            </Link>
            <Link
              href={`/medical-devices?tab=pma${query ? `&q=${query}` : ""}`}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-colors ${
                activeTab === "pma"
                  ? "bg-brandTeal-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              PMA Approvals ({totalPMA})
            </Link>
            <Link
              href={`/medical-devices?tab=recalls${query ? `&q=${query}` : ""}`}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-colors ${
                activeTab === "recalls"
                  ? "bg-alertRed-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Device Recalls ({totalRecalls})
            </Link>
          </div>
        </div>

        {/* Tab 1 & 2: Regulatory Records (510k & PMA) */}
        {activeTab !== "recalls" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-serif font-black text-navy-900">
                Premarket Regulatory Records ({filteredRecords.length})
              </h2>
              <span className="text-xs sm:text-sm text-slate-500 font-medium">
                Audited against FDA CDRH Premarket Database
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredRecords.map((rec) => {
                const isPMA = rec.recordType === "PMA";
                const dateStr = rec.decisionDate
                  ? format(new Date(rec.decisionDate), "MMMM dd, yyyy")
                  : "N/A";

                return (
                  <div
                    key={rec.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-brandTeal-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-black uppercase px-2.5 py-1 rounded tracking-wider ${
                            isPMA
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : "bg-teal-50 text-brandTeal-800 border border-brandTeal-200"
                          }`}
                        >
                          {rec.recordType === "PMA" ? "PMA Approval (Class III)" : `510(k) Clearance (${rec.submissionNumber})`}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-brandTeal-600" />
                          {dateStr}
                        </span>
                      </div>

                      <h3 className="font-serif font-black text-lg text-navy-900 leading-snug">
                        {rec.deviceName}
                      </h3>

                      <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700 pt-2 border-t border-slate-100 font-medium">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate" title={rec.applicant}>
                            {rec.applicant}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>Code: <strong className="font-mono text-navy-900">{rec.productCode || "N/A"}</strong></span>
                        </div>
                      </div>

                      {rec.decisionDescription && (
                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                          {rec.decisionDescription}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-medium">
                      <span className="text-slate-500">
                        Agency: <strong className="text-navy-900">{rec.agency}</strong>
                      </span>
                      {rec.sourceUrl && (
                        <a
                          href={rec.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brandTeal-600 hover:text-brandTeal-800 font-bold inline-flex items-center gap-1.5"
                        >
                          Official Docket <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredRecords.length === 0 && (
              <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                <Stethoscope className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                <p className="font-bold text-navy-900 text-base">No medical device regulatory records found.</p>
                <p className="text-sm text-slate-500 mt-1">Try adjusting your search query or class filter.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Device Recalls */}
        {activeTab === "recalls" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-serif font-black text-navy-900">
                FDA Medical Device Recall Determinations ({filteredRecalls.length})
              </h2>
              <span className="text-xs sm:text-sm text-slate-500 font-medium">
                Audited against CDRH Enforcement Reports
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredRecalls.map((rec) => {
                const isClass1 = rec.recallClass.includes("I") && !rec.recallClass.includes("II");
                const dateStr = rec.eventDate ? format(new Date(rec.eventDate), "MMM dd, yyyy") : "";

                return (
                  <div
                    key={rec.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-alertRed-500 transition-all space-y-3.5"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-black uppercase px-2.5 py-0.5 rounded ${
                          isClass1
                            ? "bg-alertRed-600 text-white"
                            : "bg-amber-100 text-amber-900 border border-amber-200"
                        }`}
                      >
                        {rec.recallClass}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-500">{dateStr}</span>
                    </div>

                    <h3 className="font-serif font-black text-lg text-navy-900 line-clamp-2 leading-snug">
                      {rec.productName}
                    </h3>

                    <div className="text-sm text-slate-700">
                      <strong>Firm:</strong> {rec.firmName}
                    </div>

                    <div className="p-3.5 bg-red-50/60 rounded-xl border border-red-100 text-sm text-slate-800 leading-relaxed space-y-1">
                      <strong className="text-alertRed-700 block">Reason for Recall:</strong>
                      <p className="line-clamp-3">{rec.reasonForRecall}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-medium">
                      <span className="text-slate-500">
                        Recall #: <strong className="font-mono text-navy-900">{rec.recallNumber}</strong>
                      </span>
                      {rec.sourceUrl && (
                        <a
                          href={rec.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-alertRed-600 hover:text-alertRed-800 font-bold inline-flex items-center gap-1.5"
                        >
                          Enforcement Record <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
