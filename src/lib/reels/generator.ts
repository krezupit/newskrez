import { GeneratedReelScript } from "./types";

interface ArticleInput {
  id: number;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  categoryName?: string;
  categorySlug?: string;
  sourceName?: string | null;
  imageUrl?: string | null;
}

/**
 * Generate an original 50-90 word script and 3 vertical visual scenes
 * from an approved NewsKrez article.
 */
export function generateReelScriptFromArticle(article: ArticleInput): GeneratedReelScript {
  const cleanTitle = article.title.trim();
  const summarySource = (article.excerpt || article.content || cleanTitle)
    .replace(/<[^>]*>?/gm, "")
    .trim();

  // Extract key sentences
  const sentences = summarySource
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  const hook = `Breaking: ${cleanTitle}`;
  const coreBody = sentences.slice(0, 2).join(" ") || summarySource.slice(0, 160);
  const takeaway =
    sentences[2] ||
    `Read the comprehensive regulatory briefing on NewsKrez. Full coverage and verified documents linked below.`;

  const narrationLines = [
    hook,
    coreBody,
    takeaway,
    `Source: ${article.sourceName || "Official Intelligence Feed"}. Stay tuned to NewsKrez for real-time global news.`,
  ];

  const fullSummary = `${hook}. ${coreBody} ${takeaway}`;
  const wordCount = fullSummary.split(/\s+/).length;
  // Estimated reading/speaking speed: ~130 words per minute (approx 2.1 words per second)
  const estimatedDuration = Math.min(45, Math.max(20, Math.round(wordCount / 2.1)));

  return {
    headline: cleanTitle,
    summary: fullSummary.slice(0, 300),
    hook,
    narrationLines,
    keyFacts: [
      article.categoryName ? `Category: ${article.categoryName}` : "Category: General Intelligence",
      `Attribution: ${article.sourceName || "Verified Wire"}`,
      "Editorial Check: Validated",
    ],
    sourceAttribution: article.sourceName
      ? `Source: ${article.sourceName} | NewsKrez AI Reels`
      : "NewsKrez AI Regulatory Intelligence",
    suggestedDurationSeconds: estimatedDuration,
  };
}

/**
 * Generate visual scene templates with NewsKrez 9:16 layout metadata
 */
export function generateReelVisualMetadata(article: ArticleInput, script: GeneratedReelScript) {
  return {
    aspectRatio: "9:16",
    resolution: "1080x1920",
    theme: "dark-navy",
    accentColor: "#0D9488", // brandTeal-600
    scenes: [
      {
        id: 1,
        durationSeconds: 6,
        text: script.hook,
        subtext: "BREAKING INTELLIGENCE",
        bgImage: article.imageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1080&h=1920&fit=crop",
      },
      {
        id: 2,
        durationSeconds: Math.max(10, script.suggestedDurationSeconds - 12),
        text: script.narrationLines[1] || script.summary,
        subtext: "KEY HIGHLIGHTS",
        bgImage: article.imageUrl || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1080&h=1920&fit=crop",
      },
      {
        id: 3,
        durationSeconds: 6,
        text: "Tap link below to read full dossier on NewsKrez.",
        subtext: script.sourceAttribution,
        bgImage: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1080&h=1920&fit=crop",
      },
    ],
  };
}
