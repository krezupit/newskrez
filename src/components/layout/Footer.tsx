import React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ShieldCheck, Mail, Rss, ExternalLink, Globe, HeartPulse } from "lucide-react";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const regulatoryLinks = [
    { name: "U.S. FDA CDRH & CDER", url: "https://www.fda.gov", external: true },
    { name: "openFDA Data Platform", url: "https://open.fda.gov", external: true },
    { name: "World Health Organization (WHO)", url: "https://www.who.int", external: true },
    { name: "European Medicines Agency (EMA)", url: "https://www.ema.europa.eu", external: true },
    { name: "CDSCO (Government of India)", url: "https://cdsco.gov.in", external: true },
    { name: "ClinicalTrials.gov Protocol Registry", url: "https://clinicaltrials.gov", external: true },
  ];

  const intelligenceModules = [
    { name: "Medical Devices Intelligence", href: "/medical-devices" },
    { name: "FDA 510(k) Clearances Database", href: "/medical-devices?tab=510k" },
    { name: "PMA Approvals Registry", href: "/medical-devices?tab=pma" },
    { name: "FDA Medical Device Recalls", href: "/medical-devices?tab=recalls" },
    { name: "Urgent Regulatory Alerts & Warnings", href: "/alerts" },
    { name: "Pharmaceutical Approvals & GxP", href: "/category/pharmaceutical" },
  ];

  const newsCategories = [
    { name: "Pharmaceutical News", href: "/category/pharmaceutical" },
    { name: "Medical Device Innovations", href: "/category/medical-devices" },
    { name: "FDA Drug & Device Updates", href: "/category/fda-news" },
    { name: "WHO Outbreak Bulletins", href: "/category/who-healthcare" },
    { name: "Regulatory Compliance & QMSR", href: "/category/regulatory-intelligence" },
    { name: "Healthcare AI & Cybersecurity", href: "/category/technology" },
  ];

  return (
    <footer className="bg-navy-950 text-slate-300 border-t-4 border-brandTeal-600">
      {/* Top Footer Banner: Newsletter & Mission */}
      <div className="border-b border-navy-800 bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2">
              <HeartPulse className="w-5 h-5 text-brandTeal-400" />
              <span>NewsKrez Regulatory Intelligence Dispatch</span>
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Delivering verified FDA drug approvals, medical device 510(k) clearances, Class I recalls, and global WHO healthcare directives straight to biopharma and medtech professionals.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/newsletter"
              className="px-4 py-2 rounded-lg bg-brandTeal-600 hover:bg-brandTeal-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
            >
              Subscribe Free
            </Link>
            <Link
              href="/alerts"
              className="px-4 py-2 rounded-lg bg-alertRed-600/20 hover:bg-alertRed-600 text-alertRed-300 hover:text-white border border-alertRed-500/30 text-xs font-bold uppercase tracking-wider transition-all"
            >
              Live Recalls
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & About */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="light" size="md" showTagline={true} />
            <p className="text-xs leading-relaxed text-slate-400">
              NewsKrez is the premier digital authority bridging global breaking news with rigorous biopharmaceutical, medical device, and life sciences regulatory intelligence. Powered by automated ingestion protocols across openFDA, WHO, CDC, EMA, and CDSCO.
            </p>
            <div className="flex items-center gap-3 text-xs pt-2">
              <span className="flex items-center gap-1.5 text-brandTeal-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Audited Regulatory Feeds</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Globe className="w-4 h-4" />
                <span>Global Real-Time Ingestion</span>
              </span>
            </div>
          </div>

          {/* Column 1: News Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 pb-1 border-b border-navy-800">
              News Desks
            </h4>
            <ul className="space-y-2 text-xs">
              {newsCategories.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-slate-400 hover:text-brandTeal-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Medical Device Intel */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 pb-1 border-b border-navy-800">
              MedTech Intelligence
            </h4>
            <ul className="space-y-2 text-xs">
              {intelligenceModules.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-slate-400 hover:text-brandTeal-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Regulatory Agencies */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 pb-1 border-b border-navy-800">
              Official Agency Portals
            </h4>
            <ul className="space-y-2 text-xs">
              {regulatoryLinks.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-brandTeal-400 transition-colors inline-flex items-center gap-1"
                  >
                    <span>{item.name}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Regulatory & Causality Disclaimer (Crucial Section 7 & 10 requirement) */}
        <div className="mt-10 pt-6 border-t border-navy-800/80 text-[11px] text-slate-500 leading-relaxed space-y-2">
          <p>
            <strong className="text-slate-400 font-semibold">Regulatory Notice & Disclaimer:</strong> NewsKrez synthesizes publicly accessible regulatory records, openFDA data feeds, WHO advisories, and journalistic reporting for professional decision-support and educational analysis. openFDA, FDA MAUDE, and adverse event reporting systems (FAERS) represent raw voluntary submissions and do not establish proven causation or clinical liability.
          </p>
          <p>
            All product trademarks, logos, and agency designations are property of their respective owners. Neither NewsKrez nor its editorial team provides clinical medical treatment advice. Always verify with official docket publications from the US FDA, EMA, or CDSCO.
          </p>
        </div>

        {/* Bottom Bar: Copyright & System Links */}
        <div className="mt-8 pt-6 border-t border-navy-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {currentYear} <strong className="text-white">NewsKrez Media Network</strong>. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-400 text-xs">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/editorial-standards" className="hover:text-white transition-colors">
              Editorial Standards
            </Link>
            <span>•</span>
            <Link href="/api/rss" className="hover:text-white inline-flex items-center gap-1 transition-colors">
              <Rss className="w-3 h-3 text-orange-400" />
              <span>RSS Feed</span>
            </Link>
            <span>•</span>
            <Link href="/sitemap.xml" className="hover:text-white transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
