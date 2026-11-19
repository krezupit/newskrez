"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  BellOff,
  ArrowLeft,
  Loader2,
} from "lucide-react";

const ALL_CATEGORIES = [
  "General News",
  "India News",
  "World News",
  "Politics & Governance",
  "Business & Economy",
  "Technology & AI",
  "Pharmaceutical",
  "Medical Devices",
  "FDA News",
  "WHO & Healthcare",
  "Regulatory Intelligence",
];

export const UnsubscribeClient: React.FC = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(Boolean(token));
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Preference state
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>(ALL_CATEGORIES);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!token) return;

    fetch(`/api/newsletter/preferences?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.email) {
          setSubscriberEmail(data.email);
          setFrequency(data.frequency || "daily");
          setSelectedPrefs(data.preferences || ALL_CATEGORIES);
          setIsActive(data.isActive ?? true);
        }
      })
      .catch((err) => {
        setLoading(false);
        console.error("Error loading subscriber preferences:", err);
      });
  }, [token]);

  const toggleCategory = (cat: string) => {
    if (selectedPrefs.includes(cat)) {
      setSelectedPrefs(selectedPrefs.filter((c) => c !== cat));
    } else {
      setSelectedPrefs([...selectedPrefs, cat]);
    }
  };

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/newsletter/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          frequency,
          preferences: selectedPrefs,
          isActive: true,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsActive(true);
        setMessage({
          type: "success",
          text: "Your email dispatch preferences have been successfully updated.",
        });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update preferences." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOneClickUnsubscribe = async () => {
    if (!confirm("Are you sure you want to unsubscribe from all NewsKrez email notifications?")) {
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token || undefined,
          email: !token ? emailInput : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsActive(false);
        setMessage({
          type: "success",
          text: data.message || "You have been unsubscribed from all NewsKrez notifications.",
        });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to unsubscribe." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Brand header */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-navy-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to NewsKrez Home</span>
          </Link>
          <div className="w-12 h-12 bg-navy-900 text-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-serif font-black text-navy-900 tracking-tight">
            NewsKrez Email Preferences
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Manage your dispatch frequency, choose topics of interest, or unsubscribe.
          </p>
        </div>

        {/* Feedback message banner */}
        {message && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-brandTeal-600 mx-auto" />
            <p className="text-xs text-slate-500">Loading your subscription profile...</p>
          </div>
        )}

        {/* Manual email input when no token is present */}
        {!loading && !token && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="space-y-1">
              <h2 className="font-serif font-bold text-base text-navy-900">
                Unsubscribe via Email Address
              </h2>
              <p className="text-xs text-slate-500">
                Enter your subscribed email address to be removed from all upcoming dispatches.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Subscriber Email</label>
              <input
                type="email"
                required
                placeholder="name@organization.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brandTeal-500"
              />
            </div>

            <button
              onClick={handleOneClickUnsubscribe}
              disabled={submitting || !emailInput}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <BellOff className="w-4 h-4" />
              )}
              <span>Unsubscribe from All Dispatches</span>
            </button>
          </div>
        )}

        {/* Token-based preference manager */}
        {!loading && token && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Subscribed Address
                </span>
                <div className="font-bold text-navy-900 text-sm">{subscriberEmail}</div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                  isActive
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {isActive ? "Active" : "Unsubscribed"}
              </span>
            </div>

            <form onSubmit={handleUpdatePreferences} className="p-6 space-y-6">
              {/* Frequency selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-navy-900 block">
                  Dispatch Frequency
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { key: "daily", title: "Daily Digest", sub: "Curated top 5 stories" },
                    { key: "weekly", title: "Weekly Brief", sub: "Sundays summary" },
                    { key: "breaking_alerts", title: "Breaking Only", sub: "High-priority alerts" },
                  ].map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFrequency(f.key)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        frequency === f.key
                          ? "border-brandTeal-600 bg-brandTeal-50/60 text-navy-950 font-bold shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-600"
                      }`}
                    >
                      <div className="font-semibold text-xs">{f.title}</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">{f.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-navy-900 block">
                  Topics of Interest
                </label>
                <p className="text-[11px] text-slate-500">
                  Select the sectors you wish to receive updates for:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  {ALL_CATEGORIES.map((cat) => {
                    const checked = selectedPrefs.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                          checked
                            ? "bg-slate-900 text-white border-slate-900 font-bold"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span className="text-[11px] truncate">{cat}</span>
                        {checked && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-2.5 bg-brandTeal-600 hover:bg-brandTeal-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Preferences</span>
                </button>

                <button
                  type="button"
                  onClick={handleOneClickUnsubscribe}
                  disabled={submitting}
                  className="w-full sm:w-auto px-4 py-2.5 text-red-600 hover:bg-red-50 font-bold text-xs rounded-xl transition-colors text-center"
                >
                  Unsubscribe from All
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="text-center text-[11px] text-slate-400">
          NewsKrez Compliance Desk • Respecting CAN-SPAM & Hostinger Anti-Spam Guidelines
        </div>
      </div>
    </div>
  );
};
