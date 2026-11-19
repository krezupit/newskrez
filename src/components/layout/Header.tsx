"use client";

import React, { useState, useEffect, useRef } from "react";
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
  ChevronDown,
  Globe,
  Landmark,
  TrendingUp,
  Trophy,
  Film,
  GraduationCap,
  Atom,
  Leaf,
  Building2,
  Zap,
  Flame,
  Flag,
  Sparkles,
} from "lucide-react";

interface HeaderProps {
  categories?: { id: number; name: string; slug: string }[];
  user?: { name: string; email: string; role: string } | null;
}

export const Header: React.FC<HeaderProps> = ({ categories = [], user }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGeneralDropdownOpen, setIsGeneralDropdownOpen] = useState(false);
  const [isMobileGeneralOpen, setIsMobileGeneralOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentDateStr, setCurrentDateStr] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsGeneralDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // 12 General News Dropdown Categories
  const generalSubcategories = [
    { name: "India News", slug: "india-news", icon: Flag, desc: "National headlines & state updates", color: "text-amber-400" },
    { name: "World News", slug: "world-news", icon: Globe, desc: "Global affairs & diplomatic intel", color: "text-blue-400" },
    { name: "Politics", slug: "politics", icon: Landmark, desc: "Governance, elections & policy", color: "text-purple-400" },
    { name: "Business & Economy", slug: "business-economy", icon: TrendingUp, desc: "Markets, trade & corporate trends", color: "text-emerald-400" },
    { name: "Sports", slug: "sports", icon: Trophy, desc: "Tournaments, cricket & athletics", color: "text-orange-400" },
    { name: "Entertainment", slug: "entertainment", icon: Film, desc: "Cinema, streaming & culture", color: "text-pink-400" },
    { name: "Education", slug: "education", icon: GraduationCap, desc: "Universities & academic research", color: "text-cyan-400" },
    { name: "Science", slug: "science", icon: Atom, desc: "Discoveries, physics & astronomy", color: "text-indigo-400" },
    { name: "Environment", slug: "environment", icon: Leaf, desc: "Climate change & renewable energy", color: "text-emerald-400" },
    { name: "Government Updates", slug: "government-updates", icon: Building2, desc: "Official gazettes & notifications", color: "text-sky-400" },
    { name: "Breaking News", slug: "breaking-news", icon: Zap, desc: "Real-time alerts & live stories", color: "text-alertRed-400" },
    { name: "Trending News", slug: "trending-news", icon: Flame, desc: "High-engagement viral discussions", color: "text-rose-400" },
  ];

  // Required Main Navigation Order:
  // 1. Home
  // 2. General News (mega dropdown)
  // 3. Pharmaceutical
  // 4. Medical Devices
  // 5. FDA News
  // 6. WHO & Healthcare
  // 7. Technology
  // 8. Regulatory Intelligence & Compliance
  const navLinks = [
    { name: "Home", href: "/" },
    {
      name: "Reels",
      href: "/reels",
      badge: "NEW",
      highlight: true,
    },
    { name: "General News", href: "/category/general-news", hasDropdown: true },
    { name: "Pharmaceutical", href: "/category/pharmaceutical" },
    {
      name: "Medical Devices",
      href: "/medical-devices",
      badge: "INTEL",
      highlight: true,
    },
    { name: "FDA News", href: "/category/fda-news" },
    { name: "WHO & Healthcare", href: "/category/who-healthcare" },
    { name: "Technology", href: "/category/technology" },
    { name: "Regulatory Intelligence & Compliance", href: "/category/regulatory-intelligence" },
  ];

  const isGeneralActive =
    pathname === "/category/general-news" ||
    generalSubcategories.some((sub) => pathname === `/category/${sub.slug}`);

  return (
    <header className="w-full bg-white border-b border-slate-200">
      {/* 1. Top Utility Bar */}
      <div className="bg-navy-900 text-slate-200 text-sm py-2 px-4 border-b border-navy-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Date & Global Coverage Badges */}
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-200">
              {currentDateStr || "Wednesday, November 18, 2026"}
            </span>
            <span className="text-navy-700 hidden sm:inline">|</span>
            <div className="hidden lg:flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Global Coverage:</span>
              <span className="px-2 py-0.5 rounded bg-navy-800 text-brandTeal-300 font-bold border border-navy-700">
                GENERAL
              </span>
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
              href="/category/general-news"
              className="text-amber-300 hover:text-white flex items-center gap-1.5 transition-colors font-bold"
            >
              <Sparkles className="w-4 h-4" />
              <span>General News Desk</span>
            </Link>
            <span className="text-navy-700">|</span>
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
              placeholder="Search general headlines, politics, business, science, FDA..."
              className="w-full bg-slate-50 border border-slate-300 rounded-full pl-11 pr-12 py-2.5 text-sm sm:text-base text-navy-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brandTeal-500 focus:border-transparent transition-all shadow-inner font-medium"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-navy-900 text-white rounded-full p-2 hover:bg-brandTeal-600 transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Action Badges / Quick Status */}
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
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-1 sm:space-x-1.5 py-1.5 overflow-x-visible">
            {navLinks.map((link) => {
              if (link.hasDropdown) {
                return (
                  <div
                    key={link.name}
                    ref={dropdownRef}
                    className="relative group shrink-0"
                    onMouseEnter={() => setIsGeneralDropdownOpen(true)}
                    onMouseLeave={() => setIsGeneralDropdownOpen(false)}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsGeneralDropdownOpen(false)}
                      className={`px-3.5 py-2.5 rounded-lg text-sm sm:text-base font-black transition-all relative inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                        isGeneralActive
                          ? "bg-brandTeal-600 text-white shadow-sm"
                          : "text-amber-300 hover:text-white hover:bg-navy-800"
                      }`}
                    >
                      <span className="whitespace-nowrap">{link.name}</span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                          isGeneralDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </Link>

                    {/* Mega Dropdown for 12 General News Subcategories */}
                    {isGeneralDropdownOpen && (
                      <div className="absolute top-full left-0 w-[580px] lg:w-[680px] bg-navy-950 text-white rounded-2xl shadow-2xl border border-navy-800 p-5 mt-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-navy-800">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-400" />
                            <span className="font-serif font-black text-base text-white">
                              General News Topics & Desks
                            </span>
                          </div>
                          <Link
                            href="/category/general-news"
                            onClick={() => setIsGeneralDropdownOpen(false)}
                            className="text-xs font-bold text-brandTeal-300 hover:text-white transition-colors"
                          >
                            View All General News →
                          </Link>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {generalSubcategories.map((sub) => {
                            const SubIcon = sub.icon;
                            const isSubActive = pathname === `/category/${sub.slug}`;
                            return (
                              <Link
                                key={sub.slug}
                                href={`/category/${sub.slug}`}
                                onClick={() => setIsGeneralDropdownOpen(false)}
                                className={`p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                                  isSubActive
                                    ? "bg-brandTeal-900/60 border-brandTeal-500 text-white"
                                    : "bg-navy-900/70 border-navy-800/80 hover:border-brandTeal-500/50 hover:bg-navy-800 text-slate-200"
                                }`}
                              >
                                <div className={`p-2 rounded-lg bg-navy-950 shrink-0 ${sub.color}`}>
                                  <SubIcon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <span className="block font-bold text-sm text-white truncate">
                                    {sub.name}
                                  </span>
                                  <span className="block text-[11px] text-slate-400 truncate leading-tight">
                                    {sub.desc}
                                  </span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2.5 rounded-lg text-sm sm:text-base font-bold transition-all relative inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-brandTeal-600 text-white shadow-sm"
                      : "text-slate-100 hover:text-white hover:bg-navy-800"
                  } ${link.highlight ? "text-brandTeal-300 font-extrabold" : ""}`}
                >
                  {link.name}
                  {link.badge && (
                    <span className="text-[11px] uppercase px-1.5 py-0.5 rounded bg-brandTeal-500/25 text-brandTeal-200 border border-brandTeal-400/40 font-black">
                      {link.badge}
                    </span>
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
              placeholder="Search news, topics, devices..."
              className="w-full bg-navy-900 border border-navy-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brandTeal-500 font-medium"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <div className="space-y-1 text-base font-semibold">
            {/* Home Link */}
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-lg hover:bg-navy-800 flex items-center justify-between"
            >
              <span>Home</span>
            </Link>

            <Link
              href="/reels"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-lg bg-brandTeal-600/30 border border-brandTeal-500/40 text-brandTeal-200 font-black flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-brandTeal-300" />
                <span>News Reels Feed</span>
              </div>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-brandTeal-500 text-white">
                NEW
              </span>
            </Link>

            {/* General News Accordion in Mobile */}
            <div className="rounded-xl bg-navy-900/60 border border-navy-800 overflow-hidden">
              <button
                onClick={() => setIsMobileGeneralOpen(!isMobileGeneralOpen)}
                className="w-full px-3.5 py-3 flex items-center justify-between text-amber-300 font-black hover:bg-navy-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>General News</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isMobileGeneralOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isMobileGeneralOpen && (
                <div className="p-2 space-y-1 bg-navy-950/80 border-t border-navy-800">
                  <Link
                    href="/category/general-news"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-xs font-black text-brandTeal-400 hover:text-brandTeal-300 uppercase tracking-wider"
                  >
                    View All General News →
                  </Link>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {generalSubcategories.map((sub) => {
                      const SubIcon = sub.icon;
                      return (
                        <Link
                          key={sub.slug}
                          href={`/category/${sub.slug}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-xs font-bold text-slate-200"
                        >
                          <SubIcon className={`w-3.5 h-3.5 shrink-0 ${sub.color}`} />
                          <span className="truncate">{sub.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Other Nav Links */}
            {navLinks
              .filter((l) => l.name !== "Home" && l.name !== "General News")
              .map((link) => (
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
