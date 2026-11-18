import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/auth";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";
import { NewsletterBox } from "@/components/home/NewsletterBox";
import { Mail, CheckCircle2, ShieldCheck, Clock, Bell } from "lucide-react";

export default async function NewsletterPage() {
  const currentUser = await getCurrentUser();

  const navCategories = await db.query.categories.findMany({
    where: and(eq(schema.categories.isActive, true), eq(schema.categories.isNav, true)),
    orderBy: [schema.categories.displayOrder],
    limit: 10,
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header categories={navCategories} user={currentUser} />

      <main className="max-w-4xl mx-auto px-4 py-12 flex-1 w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-teal-50 text-brandTeal-600 mb-2">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-navy-900">
            NewsKrez Regulatory Intelligence Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Essential daily and weekly executive briefings designed for pharmaceutical executives, medical device engineers, regulatory affairs managers, and hospital directors.
          </p>
        </div>

        <NewsletterBox />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-brandTeal-700 font-bold text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Daily Morning Wire</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Synthesized updates on overnight FDA approvals, European Medicines Agency decisions, and WHO disease notices.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-alertRed-600 font-bold text-xs uppercase tracking-wider">
              <Bell className="w-4 h-4" />
              <span>Instant Recall Flashes</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Immediate alert notifications whenever the FDA designates a Class I medical device or pharmaceutical drug recall.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-navy-900 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Weekend GxP Deep-Dive</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Detailed technical compliance analysis on 21 CFR Part 11, FDA QMSR transition, and ISO 13485 audit findings.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
