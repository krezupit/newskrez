import React from "react";
import Link from "next/link";
import { ArticleCard, ArticleCardData } from "@/components/news/ArticleCard";
import { Activity, ChevronRight, Stethoscope } from "lucide-react";

interface DeviceRecord {
  id: number;
  deviceName: string;
  manufacturerName: string;
  deviceClass: string;
  clearanceType: string;
  medicalSpecialty?: string | null;
  productCode?: string | null;
}

interface MedicalDevicesSectionProps {
  articles: ArticleCardData[];
  recentDevices?: DeviceRecord[];
}

export const MedicalDevicesSection: React.FC<MedicalDevicesSectionProps> = ({
  articles = [],
  recentDevices = [],
}) => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b-2 border-brandTeal-600 mb-6 gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brandTeal-50 text-brandTeal-700">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-black text-navy-900">
              Medical Devices & MedTech Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              510(k) clearances, PMA premarket authorizations, AI-driven diagnostics, and MDR compliance
            </p>
          </div>
        </div>
        <Link
          href="/medical-devices"
          className="text-xs sm:text-sm font-bold text-brandTeal-700 hover:text-brandTeal-800 flex items-center gap-1 group"
        >
          <span>Launch Medical Devices Hub</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* News Cards (8 cols) */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {articles.slice(0, 4).map((art) => (
              <ArticleCard key={art.id} article={art} variant="standard" />
            ))}
          </div>
        </div>

        {/* Live Device Approvals Quick Ticker / Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3.5">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-navy-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-brandTeal-600" />
                Latest 510(k) & PMA Clearances
              </span>
              <span className="text-xs font-bold text-brandTeal-700 uppercase bg-brandTeal-100 px-2 py-0.5 rounded border border-brandTeal-300">
                FDA CDRH
              </span>
            </div>

            <div className="space-y-3">
              {recentDevices.map((dev) => (
                <div
                  key={dev.id}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-brandTeal-400 transition-colors shadow-2xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="px-2 py-0.5 rounded bg-brandTeal-600 text-white uppercase text-xs font-black">
                      {dev.clearanceType}
                    </span>
                    <span className="text-slate-600 font-semibold">{dev.deviceClass}</span>
                  </div>
                  <h4 className="font-bold text-sm text-navy-900 line-clamp-2 leading-snug">
                    {dev.deviceName}
                  </h4>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-500 font-medium">
                    <span className="truncate max-w-[150px] font-semibold text-slate-700">{dev.manufacturerName}</span>
                    {dev.productCode && (
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">
                        Code: {dev.productCode}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-200 text-center">
              <Link
                href="/medical-devices"
                className="text-xs sm:text-sm font-black text-brandTeal-700 hover:underline block"
              >
                Search Full Regulatory Database (510k, PMA, MAUDE) →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
