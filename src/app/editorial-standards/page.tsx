import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/auth";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";
import { ShieldCheck, Scale, FileText } from "lucide-react";

export default async function EditorialStandardsPage() {
  const currentUser = await getCurrentUser();

  const navCategories = await db.query.categories.findMany({
    where: and(eq(schema.categories.isActive, true), eq(schema.categories.isNav, true)),
    orderBy: [schema.categories.displayOrder],
    limit: 10,
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header categories={navCategories} user={currentUser} />

      <main className="max-w-4xl mx-auto px-4 py-12 flex-1 w-full space-y-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-brandTeal-600">
            <Scale className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-wider">
              NewsKrez Media Network
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-black text-navy-900">
            Editorial Guidelines & Regulatory Intelligence Standards
          </h1>

          <div className="article-prose text-sm text-slate-700 leading-relaxed space-y-4">
            <h2>1. Primary Source Verification & Regulatory Integrity</h2>
            <p>
              NewsKrez adheres to strict journalistic and technical standards regarding pharmaceutical and medical device reporting. All regulatory announcements are cross-checked directly against official public dockets published by the United States Food and Drug Administration (FDA CDRH/CDER), the World Health Organization (WHO), the European Medicines Agency (EMA), and the Central Drugs Standard Control Organisation (CDSCO).
            </p>

            <h2>2. Adverse Event Reporting & Causality Disclaimer</h2>
            <p>
              In accordance with federal regulatory practice, reports originating from FDA MedWatch, FDA MAUDE (Manufacturer and User Facility Device Experience), and FAERS (FDA Adverse Event Reporting System) represent voluntary and unconfirmed notifications. NewsKrez explicitly informs its readers that such submissions do not establish confirmed medical or biological causality.
            </p>

            <h2>3. AI Ethics & Automated Ingestion Controls</h2>
            <p>
              NewsKrez employs automated ingestion connectors with strict rate-limiting, SHA-256 deduplication, and schema validation. Computational summaries are audited by regulatory specialists prior to featured publication.
            </p>

            <h2>4. Corrections & Regulatory Retractions</h2>
            <p>
              Whenever an agency modifies a recall classification (e.g. from Class II to Class I, or termination of an enforcement action), NewsKrez immediately updates the respective database record and appends a timestamped correction note.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
