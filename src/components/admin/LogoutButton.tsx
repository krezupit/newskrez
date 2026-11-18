"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";

export const LogoutButton: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.error("Logout request error:", err);
    } finally {
      // Force navigation to login page and clear router cache
      router.push("/admin/login");
      router.refresh();
      // Ensure hard redirect in case of router caching
      window.location.href = "/admin/login";
    }
  };

  return (
    <form onSubmit={handleLogout} action="/api/auth/logout" method="POST">
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-alertRed-400 hover:text-alertRed-300 hover:bg-navy-900 transition-colors text-left text-xs font-semibold disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-alertRed-400" />
        ) : (
          <LogOut className="w-3.5 h-3.5" />
        )}
        <span>{loading ? "Signing out..." : "Sign Out"}</span>
      </button>
    </form>
  );
};
