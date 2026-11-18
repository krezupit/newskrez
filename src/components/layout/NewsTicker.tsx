"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertCircle, Pause, Play } from "lucide-react";

interface TickerItem {
  id: number;
  title: string;
  category: string;
  url: string;
  isAlert?: boolean;
}

interface NewsTickerProps {
  items: TickerItem[];
}

export const NewsTicker: React.FC<NewsTickerProps> = ({ items }) => {
  const [isPaused, setIsPaused] = useState(false);

  if (!items || items.length === 0) return null;

  return (
    <div className="bg-navy-950 text-white border-y border-navy-800 text-sm py-2 px-4 overflow-hidden relative shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center">
        {/* Ticker Label Badge */}
        <div className="flex items-center gap-2 bg-alertRed-600 text-white px-3 py-1 rounded font-black uppercase tracking-wider text-xs shrink-0 z-10 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <AlertCircle className="w-4 h-4" />
          <span>Alerts & Breaking</span>
        </div>

        {/* Ticker Content */}
        <div
          className="relative overflow-hidden flex-1 mx-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className={`flex whitespace-nowrap gap-12 ${
              isPaused ? "" : "animate-ticker"
            }`}
          >
            {[...items, ...items].map((item, idx) => (
              <Link
                key={`${item.id}-${idx}`}
                href={item.url}
                className="inline-flex items-center gap-2.5 hover:text-brandTeal-300 transition-colors py-0.5 group text-sm"
              >
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                    item.isAlert
                      ? "bg-alertRed-500/25 text-alertRed-300 border border-alertRed-500/40"
                      : "bg-brandTeal-500/25 text-brandTeal-200 border border-brandTeal-500/40"
                  }`}
                >
                  {item.category}
                </span>
                <span className="font-semibold text-slate-100 group-hover:text-brandTeal-300">
                  {item.title}
                </span>
                <span className="text-slate-500 font-bold">•</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Controls */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="text-slate-400 hover:text-white p-1 rounded transition-colors hidden sm:block shrink-0 focus:outline-none"
          title={isPaused ? "Resume ticker" : "Pause ticker"}
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
