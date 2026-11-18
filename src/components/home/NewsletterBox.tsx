"use client";

import React, { useState } from "react";
import { Mail, CheckCircle, ShieldAlert, Sparkles } from "lucide-react";

export const NewsletterBox: React.FC = () => {
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, frequency }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage("Thank you for subscribing! Your regulatory intelligence briefing will arrive daily.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Subscription failed. Please check your email.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="bg-gradient-to-br from-navy-900 to-navy-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-navy-800 my-8">
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brandTeal-600/20 text-brandTeal-300 text-xs font-bold uppercase tracking-wider border border-brandTeal-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>NewsKrez Intelligence Digest</span>
        </div>

        <h3 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black text-white">
          Stay Ahead of FDA Approvals, Recalls & Life Sciences Directives
        </h3>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Join over 45,000 regulatory affairs directors, biopharma executives, medical device engineers, and clinicians who receive our curated morning briefing.
        </p>

        {status === "success" ? (
          <div className="p-4 bg-teal-900/60 border border-teal-500/50 rounded-xl text-teal-200 text-xs flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-brandTeal-400" />
            <span>{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 max-w-lg mx-auto">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your professional email (e.g. name@pharma.com)"
                required
                className="flex-1 bg-navy-800/90 border border-navy-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brandTeal-500"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-6 py-3 rounded-xl bg-brandTeal-600 hover:bg-brandTeal-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md disabled:opacity-50 shrink-0"
              >
                {status === "loading" ? "Subscribing..." : "Subscribe"}
              </button>
            </div>

            {status === "error" && (
              <p className="text-alertRed-400 text-xs text-left">{message}</p>
            )}

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1">
              <span>✓ No spam guarantee</span>
              <span>•</span>
              <span>✓ Instant 1-click unsubscribe</span>
              <span>•</span>
              <span>✓ Verified openFDA data</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
