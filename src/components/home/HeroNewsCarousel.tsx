"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  Flame,
  Pause,
  Play,
  ArrowRight,
} from "lucide-react";
import { ArticleCardData } from "@/components/news/ArticleCard";

interface HeroNewsCarouselProps {
  articles: ArticleCardData[];
  autoPlayInterval?: number; // milliseconds, default 5000
}

export const HeroNewsCarousel: React.FC<HeroNewsCarouselProps> = ({
  articles,
  autoPlayInterval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const total = articles.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
    setProgress(0);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    setProgress(0);
  }, [total]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
    setProgress(0);
  };

  // Timer for smooth auto-play and progress bar
  useEffect(() => {
    if (total <= 1 || isPaused) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    const stepMs = 50;
    const increment = (stepMs / autoPlayInterval) * 100;

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [total, isPaused, autoPlayInterval, nextSlide]);

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (diff > threshold) {
      nextSlide();
    } else if (diff < -threshold) {
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!articles || articles.length === 0) return null;

  const currentArticle = articles[currentIndex] || articles[0];

  const publishedDate = currentArticle.publishedAt
    ? formatDistanceToNow(new Date(currentArticle.publishedAt), { addSuffix: true })
    : "Recently";

  const defaultImage =
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&auto=format&fit=crop&q=80";

  return (
    <div
      className="relative group overflow-hidden rounded-2xl bg-navy-950 shadow-xl h-full min-h-[440px] sm:min-h-[480px] lg:min-h-[530px] flex flex-col justify-end select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Images with smooth cross-fade */}
      {articles.map((art, idx) => {
        const isCurrent = idx === currentIndex;
        return (
          <div
            key={art.id}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out ${
              isCurrent
                ? "opacity-100 scale-100 z-0"
                : "opacity-0 scale-105 pointer-events-none z-[-1]"
            }`}
            style={{
              backgroundImage: `url(${art.featuredImage || defaultImage})`,
            }}
          />
        );
      })}

      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/75 to-navy-950/20 z-[1]" />

      {/* Top Bar: Carousel Controls & Counter */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-900/80 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Featured Stories</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-slate-200 text-[11px] font-mono font-bold border border-white/10">
            {currentIndex + 1} / {total}
          </span>
        </div>

        {/* Play/Pause & Arrow buttons */}
        <div className="flex items-center gap-1.5 bg-navy-900/80 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-sm">
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title={isPaused ? "Resume slideshow" : "Pause slideshow"}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <div className="w-[1px] h-3.5 bg-white/20" />
          <button
            type="button"
            onClick={prevSlide}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Previous story"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Next story"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Slide Content */}
      <div className="relative z-10 p-6 sm:p-8 md:p-10 space-y-3.5">
        {/* Badges & Meta */}
        <div className="flex flex-wrap items-center gap-2">
          {currentArticle.isBreaking && (
            <span className="bg-alertRed-600 text-white text-[11px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-md shadow flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              Breaking
            </span>
          )}

          {currentArticle.categoryName && (
            <Link
              href={`/category/${currentArticle.categorySlug || "general-news"}`}
              className="bg-brandTeal-600 hover:bg-brandTeal-500 text-white text-[11px] uppercase font-extrabold tracking-wider px-3 py-0.5 rounded-md backdrop-blur-sm transition-colors shadow"
            >
              {currentArticle.categoryName}
            </Link>
          )}

          <span className="text-slate-300 text-xs flex items-center gap-1.5 font-semibold bg-black/30 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/10">
            <Clock className="w-3.5 h-3.5 text-brandTeal-300" />
            {publishedDate}
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-white leading-tight group-hover:text-brandTeal-200 transition-colors">
          <Link href={`/article/${currentArticle.slug}`}>{currentArticle.title}</Link>
        </h2>

        {/* Excerpt */}
        {currentArticle.excerpt && (
          <p className="text-xs sm:text-sm lg:text-base text-slate-200 line-clamp-2 sm:line-clamp-3 max-w-3xl leading-relaxed font-normal">
            {currentArticle.excerpt}
          </p>
        )}

        {/* Footer Meta & Read Link */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/15 text-xs text-slate-300 font-medium">
          <div className="flex items-center gap-3">
            <span>{currentArticle.readingTimeMinutes || 3} min read</span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-brandTeal-400" />
              {currentArticle.viewsCount ?? 0} views
            </span>
          </div>

          <Link
            href={`/article/${currentArticle.slug}`}
            className="inline-flex items-center gap-1.5 text-white font-bold hover:text-brandTeal-300 transition-colors uppercase tracking-wider text-[11px]"
          >
            <span>Read Full Story</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Interactive Bottom Slide Indicators / Thumbnail Strip */}
        <div className="pt-2 flex items-center gap-1.5">
          {articles.map((art, idx) => {
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={art.id}
                type="button"
                onClick={() => goToSlide(idx)}
                className={`group/btn relative h-1.5 rounded-full transition-all duration-300 ${
                  isCurrent
                    ? "w-10 sm:w-14 bg-white/20 overflow-hidden"
                    : "w-4 sm:w-6 bg-white/30 hover:bg-white/60"
                }`}
                title={`Go to story ${idx + 1}: ${art.title}`}
              >
                {/* Active animated progress bar inside the active pill */}
                {isCurrent && (
                  <div
                    className="h-full bg-brandTeal-400 transition-all ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
