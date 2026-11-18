import React from "react";
import Link from "next/link";

interface LogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = "dark",
  size = "md",
  showTagline = true,
}) => {
  const isLight = variant === "light";

  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl md:text-3xl",
    lg: "text-3xl md:text-4xl",
  };

  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  return (
    <Link href="/" className="inline-flex items-center gap-3 group focus:outline-none">
      {/* Brand Icon: Globe + Health Pulse + Tech Matrix */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center rounded-xl bg-gradient-to-br from-navy-900 via-navy-800 to-brandTeal-700 shadow-md p-1.5 transition-transform duration-200 group-hover:scale-105 border border-brandTeal-500/20`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Globe Latitude/Longitude arcs */}
          <circle cx="20" cy="20" r="16" stroke="#0D9488" strokeWidth="1.8" strokeOpacity="0.4" />
          <ellipse cx="20" cy="20" rx="9" ry="16" stroke="#0D9488" strokeWidth="1.5" strokeOpacity="0.4" />
          <line x1="4" y1="20" x2="36" y2="20" stroke="#0D9488" strokeWidth="1.5" strokeOpacity="0.4" />

          {/* Pulse / Heartbeat waveform intersecting tech node */}
          <path
            d="M8 20.5H14L16.5 12L20.5 28L23.5 16L25.5 20.5H32"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Regulatory Intelligence Spark / Signal Node */}
          <circle cx="20.5" cy="28" r="2.2" fill="#DC2626" />
          <circle cx="16.5" cy="12" r="2" fill="#0D9488" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className={`font-serif tracking-tight font-black leading-none ${sizeClasses[size]}`}>
          <span className={isLight ? "text-white" : "text-navy-900"}>News</span>
          <span className="text-brandTeal-600">Krez</span>
        </div>
        {showTagline && (
          <span
            className={`text-[9px] md:text-[10px] tracking-wider uppercase font-semibold mt-1 ${
              isLight ? "text-slate-300" : "text-slate-500"
            }`}
          >
            Global News <span className="text-brandTeal-500">•</span> Regulatory Intelligence
          </span>
        )}
      </div>
    </Link>
  );
};
