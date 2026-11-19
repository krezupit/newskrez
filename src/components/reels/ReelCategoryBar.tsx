"use client";

import React from "react";

export interface CategoryOption {
  name: string;
  slug: string;
}

export const REEL_CATEGORIES: CategoryOption[] = [
  { name: "All Reels", slug: "all" },
  { name: "General News", slug: "general-news" },
  { name: "India", slug: "india-news" },
  { name: "World", slug: "world-news" },
  { name: "Politics", slug: "politics" },
  { name: "Business", slug: "business-economy" },
  { name: "Sports", slug: "sports" },
  { name: "Entertainment", slug: "entertainment" },
  { name: "Pharmaceutical", slug: "pharmaceutical" },
  { name: "Medical Devices", slug: "medical-devices" },
  { name: "FDA News", slug: "fda-news" },
  { name: "WHO & Healthcare", slug: "who-healthcare" },
  { name: "Technology", slug: "technology" },
  { name: "Regulatory Intel", slug: "regulatory-intelligence" },
];

interface ReelCategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

export const ReelCategoryBar: React.FC<ReelCategoryBarProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2.5 px-3 flex items-center gap-2 z-30">
      {REEL_CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.slug;
        return (
          <button
            key={cat.slug}
            onClick={() => onSelectCategory(cat.slug)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-xs shrink-0 backdrop-blur-md ${
              isSelected
                ? "bg-brandTeal-500 text-white shadow-md ring-2 ring-brandTeal-300/40"
                : "bg-navy-900/70 text-slate-200 hover:bg-navy-800 hover:text-white border border-slate-700/50"
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};
