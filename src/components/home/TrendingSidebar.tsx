import React from "react";
import Link from "next/link";
import { ArticleCardData } from "@/components/news/ArticleCard";
import { AdPlacement } from "./AdPlacement";
import { TrendingUp, Flame, ShieldAlert, Award, FileText } from "lucide-react";

interface TrendingSidebarProps {
  trendingArticles: ArticleCardData[];
  editorsPicks: ArticleCardData[];
}

export const TrendingSidebar: React.FC<TrendingSidebarProps> = ({
  trendingArticles = [],
  editorsPicks = [],
}) => {
  return (
    <aside className="space-y-6">
      {/* 1. Trending Articles List */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3 text-navy-900">
          <Flame className="w-4 h-4 text-alertRed-600" />
          <h3 className="font-serif font-bold text-sm uppercase tracking-wider">
            Trending & Most Read
          </h3>
        </div>

        <div className="space-y-3">
          {trendingArticles.map((art, idx) => (
            <div key={art.id} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-b-0 group">
              <span className="font-serif font-black text-lg text-slate-300 group-hover:text-brandTeal-600 transition-colors w-5 shrink-0">
                0{idx + 1}
              </span>
              <div className="flex-1 space-y-1">
                {art.categoryName && (
                  <span className="text-[10px] font-bold text-brandTeal-600 uppercase">
                    {art.categoryName}
                  </span>
                )}
                <h4 className="font-serif font-semibold text-xs sm:text-sm text-navy-900 leading-snug line-clamp-2 group-hover:text-brandTeal-600 transition-colors">
                  <Link href={`/article/${art.slug}`}>{art.title}</Link>
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Sidebar Ad Placement */}
      <AdPlacement placement="sidebar_top" />

      {/* 3. Editor's Regulatory Picks */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200 mb-3 text-navy-900">
          <Award className="w-4 h-4 text-brandTeal-600" />
          <h3 className="font-serif font-bold text-sm uppercase tracking-wider">
            Editor's Deep-Dive Analysis
          </h3>
        </div>

        <div className="space-y-3">
          {editorsPicks.map((art) => (
            <div key={art.id} className="space-y-1 py-1.5 border-b border-slate-200/50 last:border-b-0 group">
              <span className="text-[9px] uppercase font-bold text-slate-500">
                {art.categoryName || "Analysis"}
              </span>
              <h4 className="font-serif font-bold text-xs text-navy-900 line-clamp-2 group-hover:text-brandTeal-600 transition-colors">
                <Link href={`/article/${art.slug}`}>{art.title}</Link>
              </h4>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Quick Regulatory Agency Portals Box */}
      <div className="bg-navy-900 text-white rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-brandTeal-300 font-serif font-bold text-xs uppercase tracking-wider pb-2 border-b border-navy-800">
          <FileText className="w-4 h-4" />
          <span>Agency Direct Access</span>
        </div>
        <ul className="text-xs space-y-2 text-slate-300">
          <li>
            <a
              href="https://www.fda.gov/drugs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brandTeal-300 flex items-center justify-between"
            >
              <span>FDA CDER Drug Portals</span>
              <span className="text-slate-500">↗</span>
            </a>
          </li>
          <li>
            <a
              href="https://www.fda.gov/medical-devices"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brandTeal-300 flex items-center justify-between"
            >
              <span>FDA CDRH Device Portals</span>
              <span className="text-slate-500">↗</span>
            </a>
          </li>
          <li>
            <a
              href="https://www.who.int/emergencies/disease-outbreak-news"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brandTeal-300 flex items-center justify-between"
            >
              <span>WHO Disease Outbreak News</span>
              <span className="text-slate-500">↗</span>
            </a>
          </li>
          <li>
            <a
              href="https://cdsco.gov.in/opencms/opencms/en/Medical-Device/Medical-Device/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brandTeal-300 flex items-center justify-between"
            >
              <span>CDSCO Medical Device Dockets</span>
              <span className="text-slate-500">↗</span>
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
};
