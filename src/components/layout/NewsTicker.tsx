"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertCircle, ChevronRight, Pause, Play } from "lucide-react";

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
    <div className="bg-navy-950 text-white border-y border-navy-800 text-xs py-1.5 px-4 overflow-hidden relative shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center">
        {/* Ticker Label Badge */}
        <div className="flex items-center gap-1.5 bg-alertRed-600 text-white px-2.5 py-1 rounded font-bold uppercase tracking-wider text-[10px] shrink-0 z-10 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Alerts & Breaking</span>
        </div>

        {/* Ticker Content */}
        <div
          className="relative overflow-hidden flex-1 mx-3"
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
                className="inline-flex items-center gap-2 hover:text-brandTeal-300 transition-colors py-0.5 group"
              >
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${
                    item.isAlert
                      ? "bg-alertRed-500/20 text-alertRed-400 border border-alertRed-500/30"
                      : "bg-brandTeal-500/20 text-brandTeal-300 border border-brandTeal-500/30"
                  }`}
                >
                  {item.category}
                </span>
                <span className="font-medium text-slate-200 group-hover:text-brandTeal-300">
                  {item.title}
                </span>
                <span className="text-slate-600">•</span>
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
          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
