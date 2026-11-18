"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import {
  Search,
  User,
  Menu,
  X,
  ShieldCheck,
  Activity,
  FileText,
  Bell,
  Cpu,
  Globe,
  SlidersHorizontal,
} from "lucide-react";

interface HeaderProps {
  categories?: { id: number; name: string; slug: string }[];
  user?: { name: string; email: string; role: string } | null;
}

export const Header: React.FC<HeaderProps> = ({ categories = [], user }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentDateStr, setCurrentDateStr] = useState("");

  useEffect(() => {
    const now = new Date();
    setCurrentDateStr(
      now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Pharmaceutical", href: "/category/pharmaceutical" },
    {
      name: "Medical Devices",
      href: "/medical-devices",
      badge: "INTEL",
      highlight: true,
    },
    { name: "FDA News", href: "/category/fda-news" },
    { name: "WHO & Healthcare", href: "/category/who-healthcare" },
    { name: "Regulatory Intelligence", href: "/category/regulatory-intelligence" },
    { name: "Technology", href: "/category/technology" },
    { name: "General News", href: "/category/general-news" },
    { name: "Recalls & Alerts", href: "/alerts", alert: true },
  ];

  return (
    <header className="w-full bg-white border-b border-slate-200">
      {/* 1. Top Utility Bar */}
      <div className="bg-navy-900 text-slate-300 text-xs py-1.5 px-4 border-b border-navy-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Date & Global Regulatory Badges */}
          <div className="flex items-center gap-3">
            <span className="font-medium text-slate-300">
              {currentDateStr || "Wednesday, November 18, 2026"}
            </span>
            <span className="text-navy-700 hidden sm:inline">|</span>
            <div className="hidden lg:flex items-center gap-2 text-[11px]">
              <span className="text-slate-400">Intelligence Coverage:</span>
              <span className="px-1.5 py-0.5 rounded bg-navy-800 text-brandTeal-400 font-semibold border border-navy-700">
                FDA
              </span>
              <span className="px-1.5 py-0.5 rounded bg-navy-800 text-brandTeal-400 font-semibold border border-navy-700">
                WHO
              </span>
              <span className="px-1.5 py-0.5 rounded bg-navy-800 text-brandTeal-400 font-semibold border border-navy-700">
                EMA
              </span>
              <span className="px-1.5 py-0.5 rounded bg-navy-800 text-brandTeal-400 font-semibold border border-navy-700">
                CDSCO
              </span>
            </div>
          </div>

          {/* Right: Quick Links & User Portal */}
          <div className="flex items-center gap-4 text-[11px] font-medium ml-auto">
            <Link
              href="/medical-devices"
              className="text-brandTeal-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>510(k) & PMA Database</span>
            </Link>
            <span className="text-navy-700">|</span>
            <Link
              href="/newsletter"
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Newsletter</span>
            </Link>
            <span className="text-navy-700">|</span>
            {user ? (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-brandTeal-600 text-white hover:bg-brandTeal-700 font-semibold transition-colors shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin CMS ({user.role})</span>
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="hover:text-white flex items-center gap-1 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Editorial Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Header Branding & Global Search */}
      <div className="max-w-7xl mx-auto px-4 py-3.5 sm:py-5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Logo size="md" showTagline={true} />

        {/* Global Search Bar (Desktop) */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search drugs, 510(k), recalls, devices, guidance..."
              className="w-full bg-slate-50 border border-slate-300 rounded-full pl-10 pr-10 py-2 text-xs sm:text-sm text-navy-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brandTeal-500 focus:border-transparent transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-navy-900 text-white rounded-full p-1.5 hover:bg-brandTeal-600 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Action Badges / Quick Regulatory Status */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/alerts"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-alertRed-500/20 bg-alertRed-50/50 hover:bg-alertRed-100/60 transition-colors group"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-alertRed-600 animate-pulse" />
            <div className="text-left">
              <span className="block text-[10px] font-bold text-alertRed-600 uppercase tracking-wider">
                FDA Recalls Active
              </span>
              <span className="block text-xs font-semibold text-navy-900">
                Class I & II Notices
              </span>
            </div>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-navy-900 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* 3. Sticky Category Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-navy-900 text-white shadow-md border-t border-navy-800">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-1 sm:space-x-2 py-1 whitespace-nowrap">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all relative inline-flex items-center gap-1.5 ${
                    isActive
                      ? "bg-brandTeal-600 text-white shadow-sm"
                      : "text-slate-200 hover:text-white hover:bg-navy-800"
                  } ${link.highlight ? "text-brandTeal-300 font-bold" : ""}`}
                >
                  {link.name}
                  {link.badge && (
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-brandTeal-500/20 text-brandTeal-300 border border-brandTeal-400/40">
                      {link.badge}
                    </span>
                  )}
                  {link.alert && (
                    <span className="w-1.5 h-1.5 rounded-full bg-alertRed-500 animate-ping" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-navy-950 text-white border-b border-navy-800 px-4 py-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news, devices, approvals..."
              className="w-full bg-navy-900 border border-navy-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brandTeal-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <div className="grid grid-cols-1 gap-1 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded hover:bg-navy-800 flex items-center justify-between"
              >
                <span>{link.name}</span>
                {link.badge && (
                  <span className="text-[10px] bg-brandTeal-600 px-1.5 py-0.5 rounded text-white font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-navy-800 flex items-center justify-between text-xs text-slate-400">
            <Link
              href="/admin/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-brandTeal-400 font-semibold"
            >
              Editorial Staff Sign In →
            </Link>
            <Link
              href="/medical-devices"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-slate-300"
            >
              Device Intelligence
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
