import React from "react";

interface AdPlacementProps {
  placement: "header_top" | "homepage_middle" | "sidebar_top" | "in_article" | "footer_banner";
  title?: string;
  sponsorName?: string;
  imageUrl?: string;
  targetUrl?: string;
  codeSnippet?: string;
  className?: string;
}

export const AdPlacement: React.FC<AdPlacementProps> = ({
  placement,
  title,
  sponsorName,
  imageUrl,
  targetUrl,
  codeSnippet,
  className = "",
}) => {
  // Homepage middle banner format (e.g. 728x90 or 970x250)
  if (placement === "homepage_middle" || placement === "header_top") {
    return (
      <div className={`w-full max-w-7xl mx-auto px-4 my-6 ${className}`}>
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 sm:p-4 text-center">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">
            <span>Advertisement</span>
            {sponsorName && <span>Sponsored by {sponsorName}</span>}
          </div>

          {targetUrl && imageUrl ? (
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg overflow-hidden group shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={imageUrl}
                alt={title || "NewsKrez Partner"}
                className="w-full max-h-40 sm:max-h-52 object-cover rounded-lg group-hover:opacity-95 transition-opacity"
              />
            </a>
          ) : codeSnippet ? (
            <div dangerouslySetInnerHTML={{ __html: codeSnippet }} />
          ) : (
            <div className="h-24 sm:h-28 bg-gradient-to-r from-slate-200 to-slate-100 rounded-lg flex flex-col items-center justify-center p-3 text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Responsive Leaderboard Ad Unit (728 × 90 / 970 × 250)
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                Google AdSense • Compliant Biopharma & MedTech Placement
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Sidebar Ad (300x250 or 300x600)
  return (
    <div className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-center ${className}`}>
      <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">
        <span>Sponsored Intelligence</span>
      </div>

      {targetUrl && imageUrl ? (
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg overflow-hidden group shadow-sm"
        >
          <img
            src={imageUrl}
            alt={title || "Sponsor"}
            className="w-full h-48 object-cover rounded-lg group-hover:scale-102 transition-transform"
          />
          {title && (
            <p className="text-xs font-bold text-navy-900 mt-2 text-left line-clamp-1 group-hover:text-brandTeal-600">
              {title}
            </p>
          )}
        </a>
      ) : codeSnippet ? (
        <div dangerouslySetInnerHTML={{ __html: codeSnippet }} />
      ) : (
        <div className="min-h-[250px] bg-white border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center p-4">
          <span className="text-xs font-bold text-slate-600">Medical Device Software Compliance</span>
          <p className="text-[11px] text-slate-400 mt-1">Automated 21 CFR Part 820 & ISO 13485 Verification</p>
          <span className="mt-3 text-xs font-bold text-brandTeal-600 underline">Explore Solution →</span>
        </div>
      )}
    </div>
  );
};
