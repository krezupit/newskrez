"use client";

import React, { useState } from "react";
import { ReelItem } from "@/lib/reels/types";
import {
  Heart,
  Share2,
  Volume2,
  VolumeX,
  Eye,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";

interface ReelOverlayProps {
  reel: ReelItem;
  isMuted: boolean;
  onToggleMute: () => void;
  onNextReel: () => void;
  onPrevReel: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export const ReelOverlay: React.FC<ReelOverlayProps> = ({
  reel,
  isMuted,
  onToggleMute,
  onNextReel,
  onPrevReel,
  hasPrev,
  hasNext,
}) => {
  const [likes, setLikes] = useState(reel.likesCount || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasLiked) return;
    setHasLiked(true);
    setLikes((prev) => prev + 1);
    try {
      await fetch(`/api/reels/${reel.id}/like`, { method: "POST" });
    } catch (_) {}
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/reels?id=${reel.id}` : "";
    const shareData = {
      title: reel.title,
      text: reel.description || reel.title,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (_) {}
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (_) {}
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Header Row (Back Link / Title info) */}
      <div className="pt-2 flex items-center justify-between pointer-events-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy-950/70 hover:bg-navy-900 text-white text-xs font-bold border border-slate-700/60 backdrop-blur-md transition-colors"
        >
          <span>← Back to Portal</span>
        </Link>

        {/* Category Pill */}
        <span className="px-3 py-1 rounded-full bg-brandTeal-600/90 text-white text-[11px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md">
          {reel.categoryName || "General News"}
        </span>
      </div>

      {/* Main Bottom Section: Metadata + Right-hand Action Bar */}
      <div className="flex items-end justify-between gap-4 pb-2">
        {/* Left Bottom Details */}
        <div className="space-y-2.5 max-w-[80%] pointer-events-auto">
          {/* Publisher Badge */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brandTeal-700 border-2 border-brandTeal-400 flex items-center justify-center text-white font-black text-xs shadow-md">
              {(reel.channelTitle || reel.sourceName || "NK")[0].toUpperCase()}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-white drop-shadow-md">
                {reel.channelTitle || reel.sourceName || "NewsKrez Intelligence"}
              </span>
              <CheckCircle2 className="w-4 h-4 text-brandTeal-400 fill-brandTeal-400/20" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-base sm:text-lg font-serif font-black text-white leading-snug drop-shadow-md line-clamp-2">
            {reel.title}
          </h1>

          {/* Expandable Description */}
          {reel.description && (
            <div className="text-xs text-slate-200 drop-shadow-sm">
              <p className={isDescExpanded ? "line-clamp-none" : "line-clamp-1"}>
                {reel.description}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDescExpanded(!isDescExpanded);
                }}
                className="text-brandTeal-300 font-bold hover:underline text-[11px] mt-0.5 block"
              >
                {isDescExpanded ? "Show less" : "...more"}
              </button>
            </div>
          )}

          {/* Related Full News Article Link if present */}
          {reel.relatedArticleSlug && (
            <div className="pt-1">
              <Link
                href={`/article/${reel.relatedArticleSlug}`}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brandTeal-600/90 hover:bg-brandTeal-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg backdrop-blur-md group"
              >
                <span>Read Full Article Dossier</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}

          {/* Rights & Attribution tag */}
          <div className="text-[10px] text-slate-400 flex items-center gap-2">
            <span>{reel.rightsStatus || "Authorized Official Embed"}</span>
            <span>•</span>
            <span>NewsKrez Reels Feed</span>
          </div>
        </div>

        {/* Right Vertical Action Bar */}
        <div className="flex flex-col items-center gap-4 pointer-events-auto pb-1">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className="flex flex-col items-center gap-1 group"
            title="Like this reel"
          >
            <div
              className={`p-3 rounded-full backdrop-blur-md transition-all shadow-lg ${
                hasLiked
                  ? "bg-rose-600 text-white scale-110"
                  : "bg-black/50 hover:bg-black/70 text-white"
              }`}
            >
              <Heart className={`w-5 h-5 ${hasLiked ? "fill-white" : ""}`} />
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow-md">
              {likes}
            </span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1 group"
            title="Share reel"
          >
            <div className="p-3 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-all shadow-lg">
              {isCopied ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow-md">
              {isCopied ? "Copied!" : "Share"}
            </span>
          </button>

          {/* Views Counter */}
          <div className="flex flex-col items-center gap-1">
            <div className="p-3 rounded-full bg-black/50 text-slate-300 backdrop-blur-md shadow-lg">
              <Eye className="w-5 h-5 text-brandTeal-400" />
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow-md">
              {reel.viewsCount || 0}
            </span>
          </div>

          {/* Sound Mute / Unmute Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            className="p-3 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-all shadow-lg"
            title={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-alertRed-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-brandTeal-300" />
            )}
          </button>

          {/* Desktop Arrow Controls */}
          <div className="hidden sm:flex flex-col gap-1.5 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrevReel();
              }}
              disabled={!hasPrev}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white disabled:opacity-30 backdrop-blur-md transition-all shadow-sm"
              title="Previous reel (Up arrow)"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNextReel();
              }}
              disabled={!hasNext}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white disabled:opacity-30 backdrop-blur-md transition-all shadow-sm"
              title="Next reel (Down arrow)"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
