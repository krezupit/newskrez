"use client";

import React, { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";

export const LogoutButton: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });
    } catch (err) {
      console.error("Logout request error:", err);
    } finally {
      // Unconditional full browser reload/redirect to /admin/login to guarantee fresh session state
      window.location.href = "/admin/login";
    }
  };

  return (
    <form action="/api/auth/logout" method="POST">
      <button
        type="submit"
        onClick={handleLogout}
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
