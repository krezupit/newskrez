"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ReelItem } from "@/lib/reels/types";
import { ReelPlayer } from "./ReelPlayer";
import { ReelOverlay } from "./ReelOverlay";
import { ReelCategoryBar } from "./ReelCategoryBar";
import { Film, Sparkles, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";

interface ReelsFeedProps {
  initialReels: ReelItem[];
  initialCategory?: string;
}

export const ReelsFeed: React.FC<ReelsFeedProps> = ({
  initialReels = [],
  initialCategory = "all",
}) => {
  const [reels, setReels] = useState<ReelItem[]>(initialReels);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Swipe gesture references
  const touchStartY = useRef<number>(0);
  const isScrolling = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewedReels = useRef<Set<number>>(new Set());

  // Record view after 2 seconds on active reel
  useEffect(() => {
    const currentReel = reels[currentIndex];
    if (!currentReel || viewedReels.current.has(currentReel.id)) return;

    const timer = setTimeout(async () => {
      viewedReels.current.add(currentReel.id);
      try {
        await fetch(`/api/reels/${currentReel.id}/view`, { method: "POST" });
      } catch (_) {}
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentIndex, reels]);

  // Fetch reels on category change
  const fetchCategoryReels = useCallback(
    async (catSlug: string) => {
      setLoading(true);
      setCurrentIndex(0);
      try {
        const res = await fetch(`/api/reels?cat=${catSlug}&page=1&limit=20`);
        const data = await res.json();
        if (data.success && data.reels) {
          setReels(data.reels);
          setHasMore(data.hasMore);
          setPage(1);
        }
      } catch (err) {
        console.error("Error loading category reels:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSelectCategory = (catSlug: string) => {
    setSelectedCategory(catSlug);
    fetchCategoryReels(catSlug);
  };

  const handleNextReel = useCallback(() => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, reels.length]);

  const handlePrevReel = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        handleNextReel();
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        handlePrevReel();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNextReel, handlePrevReel]);

  // Wheel scroll with debounce
  const handleWheel = (e: React.WheelEvent) => {
    if (isScrolling.current) return;
    if (Math.abs(e.deltaY) > 35) {
      isScrolling.current = true;
      if (e.deltaY > 0) {
        handleNextReel();
      } else {
        handlePrevReel();
      }
      setTimeout(() => {
        isScrolling.current = false;
      }, 450);
    }
  };

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        handleNextReel(); // Swiped Up -> Next Reel
      } else {
        handlePrevReel(); // Swiped Down -> Prev Reel
      }
    }
  };

  const activeReel = reels[currentIndex];

  return (
    <div className="relative w-full h-[100dvh] bg-navy-950 overflow-hidden flex flex-col items-center justify-center">
      {/* Background Ambient Blur of Active Reel for Desktop View */}
      {activeReel?.thumbnailUrl && (
        <div
          className="hidden md:block absolute inset-0 z-0 bg-cover bg-center filter blur-3xl opacity-20 scale-125 transition-all duration-700 pointer-events-none"
          style={{ backgroundImage: `url(${activeReel.thumbnailUrl})` }}
        />
      )}

      {/* Top Floating Category Bar */}
      <div className="absolute top-0 inset-x-0 z-40 max-w-lg mx-auto flex flex-col">
        <ReelCategoryBar
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
      </div>

      {/* Main 9:16 Feed Container */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full h-full sm:h-[94vh] sm:max-w-[420px] sm:rounded-3xl overflow-hidden shadow-2xl bg-black border-0 sm:border border-navy-800/80 z-10 flex flex-col"
      >
        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-4 text-white">
            <Loader2 className="w-10 h-10 text-brandTeal-400 animate-spin" />
            <span className="text-sm font-semibold tracking-wide text-slate-300">
              Loading Verified News Reels...
            </span>
          </div>
        ) : reels.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4 text-white">
            <Film className="w-14 h-14 text-slate-500 mb-1" />
            <h3 className="text-xl font-serif font-black text-white">
              No Reels in this Category Yet
            </h3>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Our automated discovery engine regularly curates verified video shorts. Switch to
              &ldquo;All Reels&rdquo; or another category.
            </p>
            <button
              onClick={() => handleSelectCategory("all")}
              className="px-5 py-2.5 bg-brandTeal-600 hover:bg-brandTeal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Browse All Reels
            </button>
          </div>
        ) : activeReel ? (
          <div className="relative w-full h-full">
            <ReelPlayer
              key={activeReel.id}
              reel={activeReel}
              isActive={true}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted(!isMuted)}
            />
            <ReelOverlay
              reel={activeReel}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted(!isMuted)}
              onNextReel={handleNextReel}
              onPrevReel={handlePrevReel}
              hasPrev={currentIndex > 0}
              hasNext={currentIndex < reels.length - 1}
            />
          </div>
        ) : null}
      </div>

      {/* Desktop Keyboard Shortcuts Hint Pill */}
      <div className="hidden lg:flex absolute bottom-5 left-8 z-30 items-center gap-3 px-4 py-2 bg-navy-900/80 border border-navy-800 rounded-2xl text-[11px] text-slate-300 backdrop-blur-md">
        <span className="flex items-center gap-1 font-mono bg-navy-800 px-1.5 py-0.5 rounded text-white font-bold">
          ↑ / ↓
        </span>
        <span>Navigate</span>
        <span>•</span>
        <span className="flex items-center gap-1 font-mono bg-navy-800 px-1.5 py-0.5 rounded text-white font-bold">
          M
        </span>
        <span>Mute</span>
        <span>•</span>
        <span className="text-brandTeal-400 font-bold">
          {reels.length > 0 ? `${currentIndex + 1} of ${reels.length}` : ""}
        </span>
      </div>
    </div>
  );
};
