import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/auth";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";

export default async function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-400">Effective Date: November 2026</p>

          <div className="article-prose text-sm text-slate-700 leading-relaxed space-y-4">
            <p>
              NewsKrez is committed to safeguarding the privacy of our subscribers, healthcare professionals, and website visitors. This policy outlines how information is gathered, utilized, and protected across our digital services.
            </p>
            <h2>Information We Collect</h2>
            <p>
              We collect information provided directly by users when subscribing to our intelligence dispatches, contacting our editorial team, or creating an account. This includes email addresses, name, professional affiliations, and dispatch frequency preferences.
            </p>
            <h2>Cookies & Google AdSense</h2>
            <p>
              NewsKrez utilizes standard session cookies to maintain editorial access and enhance user navigation. Google and third-party advertising partners may serve non-intrusive advertisements based on prior visits to this or other websites. Users may manage cookie preferences through their individual web browser settings.
            </p>
            <h2>Data Security</h2>
            <p>
              We enforce industry-standard cryptographic protocols, including TLS encryption, salted bcrypt password hashing, and role-based server authentication to protect user records against unauthorized access.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
