import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/auth";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";

export default async function TermsOfServicePage() {
  const currentUser = await getCurrentUser();

  const navCategories = await db.query.categories.findMany({
    where: and(eq(schema.categories.isActive, true), eq(schema.categories.isNav, true)),
    orderBy: [schema.categories.displayOrder],
    limit: 10,
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header categories={navCategories} user={currentUser} />

      <main className="max-w-4xl mx-auto px-4 py-12 flex-1 w-full">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-navy-900">
            Terms of Service & Regulatory Disclaimers
          </h1>
          <p className="text-xs text-slate-400">Effective Date: November 2026</p>

          <div className="article-prose text-sm text-slate-700 leading-relaxed space-y-4">
            <h2>1. Informational & Professional Purpose Only</h2>
            <p>
              NewsKrez provides news reporting, regulatory intelligence, and summaries of official agency actions (such as FDA approvals, recalls, and WHO advisories) strictly for educational, informational, and professional decision-support purposes. Nothing on this website constitutes clinical medical advice, diagnostic recommendations, or formal legal counsel.
            </p>
            <h2>2. Reliance on Official Dockets</h2>
            <p>
              Users and healthcare organizations are advised to verify regulatory details against official agency dockets published by the United States Food and Drug Administration (FDA), European Medicines Agency (EMA), and CDSCO before making clinical or commercial commitments.
            </p>
            <h2>3. Intellectual Property</h2>
            <p>
              The original editorial articles, software architecture, and NewsKrez logos are property of NewsKrez Media Network. Public domain regulatory records (e.g. openFDA data) remain in the public domain and are attributed per agency terms.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
