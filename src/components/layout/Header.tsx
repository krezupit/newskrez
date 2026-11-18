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
  Bell,
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
      <div className="bg-navy-900 text-slate-200 text-sm py-2 px-4 border-b border-navy-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Date & Global Regulatory Badges */}
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-200">
              {currentDateStr || "Wednesday, November 18, 2026"}
            </span>
            <span className="text-navy-700 hidden sm:inline">|</span>
            <div className="hidden lg:flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Intelligence Coverage:</span>
              <span className="px-2 py-0.5 rounded bg-navy-800 text-brandTeal-300 font-bold border border-navy-700">
                FDA
              </span>
              <span className="px-2 py-0.5 rounded bg-navy-800 text-brandTeal-300 font-bold border border-navy-700">
                WHO
              </span>
              <span className="px-2 py-0.5 rounded bg-navy-800 text-brandTeal-300 font-bold border border-navy-700">
                EMA
              </span>
              <span className="px-2 py-0.5 rounded bg-navy-800 text-brandTeal-300 font-bold border border-navy-700">
                CDSCO
              </span>
            </div>
          </div>

          {/* Right: Quick Links & User Portal */}
          <div className="flex items-center gap-4 text-xs sm:text-sm font-semibold ml-auto">
            <Link
              href="/medical-devices"
              className="text-brandTeal-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Activity className="w-4 h-4" />
              <span>510(k) & PMA Database</span>
            </Link>
            <span className="text-navy-700">|</span>
            <Link
              href="/newsletter"
              className="hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Newsletter</span>
            </Link>
            <span className="text-navy-700">|</span>
            {user ? (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-brandTeal-600 text-white hover:bg-brandTeal-700 font-bold transition-colors shadow-sm text-xs"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin CMS ({user.role})</span>
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Editorial Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Header Branding & Global Search */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <Logo size="md" showTagline={true} />

        {/* Global Search Bar (Desktop) */}
        <div className="hidden md:flex items-center flex-1 max-w-lg mx-6">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search drugs, 510(k), recalls, devices, guidance..."
              className="w-full bg-slate-50 border border-slate-300 rounded-full pl-11 pr-12 py-2.5 text-sm sm:text-base text-navy-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brandTeal-500 focus:border-transparent transition-all shadow-inner font-medium"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-navy-900 text-white rounded-full p-2 hover:bg-brandTeal-600 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Action Badges / Quick Regulatory Status */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/alerts"
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-alertRed-500/25 bg-alertRed-50/70 hover:bg-alertRed-100 transition-colors group"
          >
            <div className="w-3 h-3 rounded-full bg-alertRed-600 animate-pulse" />
            <div className="text-left">
              <span className="block text-xs font-black text-alertRed-600 uppercase tracking-wider">
                FDA Recalls Active
              </span>
              <span className="block text-sm font-bold text-navy-900">
                Class I & II Notices
              </span>
            </div>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-navy-900 p-2.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* 3. Sticky Category Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-navy-900 text-white shadow-md border-t border-navy-800">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-1 sm:space-x-2 py-1.5 whitespace-nowrap">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3.5 py-2.5 rounded-lg text-sm sm:text-base font-bold transition-all relative inline-flex items-center gap-2 ${
                    isActive
                      ? "bg-brandTeal-600 text-white shadow-sm"
                      : "text-slate-100 hover:text-white hover:bg-navy-800"
                  } ${link.highlight ? "text-brandTeal-300 font-extrabold" : ""}`}
                >
                  {link.name}
                  {link.badge && (
                    <span className="text-xs uppercase px-2 py-0.5 rounded bg-brandTeal-500/25 text-brandTeal-200 border border-brandTeal-400/40 font-black">
                      {link.badge}
                    </span>
                  )}
                  {link.alert && (
                    <span className="w-2 h-2 rounded-full bg-alertRed-500 animate-ping" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-navy-950 text-white border-b border-navy-800 px-4 py-5 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news, devices, approvals..."
              className="w-full bg-navy-900 border border-navy-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brandTeal-500 font-medium"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <div className="grid grid-cols-1 gap-1 text-base font-semibold">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-lg hover:bg-navy-800 flex items-center justify-between"
              >
                <span>{link.name}</span>
                {link.badge && (
                  <span className="text-xs bg-brandTeal-600 px-2 py-0.5 rounded text-white font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-navy-800 flex items-center justify-between text-sm text-slate-400">
            <Link
              href="/admin/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-brandTeal-400 font-bold"
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
