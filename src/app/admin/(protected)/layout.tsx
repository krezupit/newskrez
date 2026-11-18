import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { LogoutButton } from "@/components/admin/LogoutButton";
import {
  LayoutDashboard,
  FileText,
  Activity,
  AlertOctagon,
  Radio,
  Globe,
  FolderTree,
  Mail,
  Sliders,
  Users,
  Megaphone,
  History,
  LogOut,
  ExternalLink,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // If on admin routes other than login, require authentication
  if (!user) {
    redirect("/admin/login");
  }

  const menuItems = [
    { name: "Dashboard Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Articles Management", href: "/admin/articles", icon: FileText },
    { name: "Medical Devices Intel", href: "/admin/devices", icon: Activity },
    { name: "FDA & WHO Alerts", href: "/admin/alerts", icon: AlertOctagon },
    { name: "News API Providers", href: "/admin/api-sources", icon: Globe },
    { name: "RSS Sources & Cron", href: "/admin/sources", icon: Radio },
    { name: "Categories & Desks", href: "/admin/categories", icon: FolderTree },
    { name: "Subscribers", href: "/admin/subscribers", icon: Mail },
    { name: "Ad Placements", href: "/admin/ads", icon: Megaphone },
    { name: "Portal Settings", href: "/admin/settings", icon: Sliders },
    { name: "Audit Trail", href: "/admin/audit-logs", icon: History },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-navy-900">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-navy-950 text-slate-300 flex flex-col shrink-0 border-r border-navy-800">
        <div className="p-4 border-b border-navy-800">
          <Logo variant="light" size="sm" showTagline={false} />
          <div className="mt-2 text-[10px] uppercase font-bold text-brandTeal-400 tracking-wider">
            Enterprise CMS Control Plane
          </div>
        </div>

        {/* User Card */}
        <div className="p-3 m-3 bg-navy-900 rounded-xl border border-navy-800 flex items-center justify-between">
          <div className="truncate">
            <span className="block font-bold text-xs text-white truncate">{user.name}</span>
            <span className="block text-[10px] text-brandTeal-300 font-semibold uppercase">{user.role}</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-navy-900 transition-colors"
              >
                <Icon className="w-4 h-4 text-brandTeal-400 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-navy-800 space-y-1 text-xs">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-900 transition-colors"
          >
            <span>Live Public Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <div className="flex-1 flex flex-col overflow-x-hidden min-h-screen">
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              NewsKrez Operations
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/admin/articles/create"
              className="px-3.5 py-1.5 rounded-lg bg-brandTeal-600 hover:bg-brandTeal-700 text-white font-bold transition-colors shadow-xs"
            >
              + Create Article
            </Link>
          </div>
        </header>

        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}
