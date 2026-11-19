"use client";

import React, { useState, useEffect, useRef } from "react";
import { ReelItem } from "@/lib/reels/types";
import { Volume2, VolumeX, Play, Pause, Sparkles, Radio } from "lucide-react";
import Image from "next/image";

interface ReelPlayerProps {
  reel: ReelItem;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const ReelPlayer: React.FC<ReelPlayerProps> = ({
  reel,
  isActive,
  isMuted,
  onToggleMute,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [speechActive, setSpeechActive] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Handle play/pause state for YouTube iframe via postMessage API
  useEffect(() => {
    if (!iframeRef.current) return;
    try {
      const command = isActive && isPlaying ? "playVideo" : "pauseVideo";
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: command, args: [] }),
        "*"
      );
    } catch (_) {}
  }, [isActive, isPlaying]);

  // Handle mute state for YouTube iframe
  useEffect(() => {
    if (!iframeRef.current) return;
    try {
      const command = isMuted ? "mute" : "unMute";
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: command, args: [] }),
        "*"
      );
    } catch (_) {}
  }, [isMuted]);

  // For AI-Generated Reels: handle scene progress and Web Speech synthesis
  useEffect(() => {
    if (reel.videoType !== "ai_generated" || !isActive) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    const scenes = reel.metadata?.scenes || [];
    if (scenes.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSceneIdx((prev) => (prev + 1) % scenes.length);
    }, 6000);

    // Optional TTS Speech narration
    if (!isMuted && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const narrationText =
        reel.metadata?.script?.narrationLines?.join(" ") || reel.description || reel.title;
      const utterance = new SpeechSynthesisUtterance(narrationText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onstart = () => setSpeechActive(true);
      utterance.onend = () => setSpeechActive(false);
      utterance.onerror = () => setSpeechActive(false);
      window.speechSynthesis.speak(utterance);
    } else {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [reel, isActive, isMuted]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // 1. AI-GENERATED ORIGINAL NEWS REEL PLAYER
  if (reel.videoType === "ai_generated") {
    const scenes = reel.metadata?.scenes || [
      {
        text: reel.title,
        subtext: "BREAKING REGULATORY INTELLIGENCE",
        bgImage: reel.thumbnailUrl,
      },
    ];
    const currentScene = scenes[currentSceneIdx] || scenes[0];

    return (
      <div
        onClick={togglePlayPause}
        className="relative w-full h-full bg-navy-950 overflow-hidden cursor-pointer select-none flex flex-col justify-between"
      >
        {/* Background Image with animated subtle zoom and dark overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={currentScene.bgImage || reel.thumbnailUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1080&h=1920&fit=crop"}
            alt={reel.title}
            className="w-full h-full object-cover transition-transform duration-1000 scale-105 filter brightness-75 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-navy-950/40" />
        </div>

        {/* Top Header Badge */}
        <div className="relative z-10 pt-14 px-6 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brandTeal-600/90 text-white rounded-full text-xs font-black uppercase tracking-wider shadow-lg backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>NewsKrez AI Reel</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-alertRed-400" /> : <Volume2 className="w-5 h-5 text-brandTeal-300" />}
          </button>
        </div>

        {/* Center Scene Headline & Subtitles */}
        <div className="relative z-10 px-6 py-8 text-center space-y-4 max-w-sm mx-auto">
          <div className="inline-block px-2.5 py-1 bg-amber-400/20 border border-amber-400/40 rounded-lg text-amber-300 text-[11px] font-black uppercase tracking-widest">
            {currentScene.subtext || "INTELLIGENCE BRIEFING"}
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-black text-white leading-tight drop-shadow-md">
            {currentScene.text || reel.title}
          </h2>

          {/* Audio Wave animation when speaking */}
          {speechActive && (
            <div className="flex items-center justify-center gap-1 pt-2">
              <span className="w-1 h-4 bg-brandTeal-400 rounded-full animate-bounce" />
              <span className="w-1 h-6 bg-brandTeal-300 rounded-full animate-bounce [animation-delay:0.1s]" />
              <span className="w-1 h-8 bg-brandTeal-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1 h-5 bg-brandTeal-300 rounded-full animate-bounce [animation-delay:0.3s]" />
              <span className="w-1 h-3 bg-brandTeal-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
        </div>

        {/* Scene Progress Indicators at bottom */}
        <div className="relative z-10 pb-28 px-6">
          <div className="flex gap-1.5 w-full">
            {scenes.map((_: any, idx: number) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  idx === currentSceneIdx
                    ? "bg-brandTeal-400 shadow-sm"
                    : idx < currentSceneIdx
                    ? "bg-white/60"
                    : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. YOUTUBE VIDEO PLAYER
  const videoId = reel.externalId;
  const embedUrl =
    videoId
      ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${
          isActive && isPlaying ? "1" : "0"
        }&mute=${isMuted ? "1" : "0"}&controls=0&loop=1&playlist=${videoId}&playsinline=1&modestbranding=1&rel=0&enablejsapi=1`
      : reel.videoUrl;

  return (
    <div
      onClick={togglePlayPause}
      className="relative w-full h-full bg-black overflow-hidden select-none cursor-pointer"
    >
      {/* 9:16 Centered Container for Video */}
      <div className="absolute inset-0 flex items-center justify-center">
        {videoId ? (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title={reel.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="w-full h-full object-cover pointer-events-none scale-[1.02]"
            tabIndex={-1}
          />
        ) : (
          <video
            src={reel.videoUrl}
            poster={reel.thumbnailUrl || undefined}
            autoPlay={isActive && isPlaying}
            muted={isMuted}
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Top Gradient Shadow for readability */}
      <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none z-10" />

      {/* Bottom Gradient Shadow for overlay text readability */}
      <div className="absolute bottom-0 inset-x-0 h-72 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none z-10" />

      {/* Click-to-Play/Pause Indicator Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="w-16 h-16 rounded-full bg-brandTeal-600/90 text-white flex items-center justify-center shadow-2xl animate-in zoom-in-75 duration-150">
            <Play className="w-8 h-8 fill-white ml-1" />
          </div>
        </div>
      )}
    </div>
  );
};
