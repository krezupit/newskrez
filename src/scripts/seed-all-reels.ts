import { db, schema } from "../db";
import { eq } from "drizzle-orm";
import { runReelsIngestion } from "../lib/reels/engine";

interface CuratedReel {
  title: string;
  categorySlug: string;
  categoryName: string;
  videoUrl: string;
  externalId: string;
  thumbnailUrl: string;
  channelTitle: string;
  rightsStatus: string;
  status: "Published" | "Pending Review";
  relatedArticleId?: number;
  description: string;
}

const CURATED_REELS: CuratedReel[] = [
  {
    title: "India Moon & Solar Mission: ISRO's Next Frontier in Deep Space Exploration",
    categorySlug: "india-news",
    categoryName: "India News",
    videoUrl: "https://www.youtube.com/watch?v=F4FTVEJsDuI",
    externalId: "F4FTVEJsDuI",
    thumbnailUrl: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=600&h=1000&fit=crop",
    channelTitle: "DD News Official",
    rightsStatus: "Authorized Embed",
    status: "Published",
    description: "Real-time updates on India's space missions, deep exploration payloads, and sovereign satellite network expansion.",
  },
  {
    title: "Global Geopolitical Realignment: Key Takeaways from World Economic Summit",
    categorySlug: "world-news",
    categoryName: "World News",
    videoUrl: "https://www.youtube.com/watch?v=9BxxDVjUCkA",
    externalId: "9BxxDVjUCkA",
    thumbnailUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&h=1000&fit=crop",
    channelTitle: "Reuters World Desk",
    rightsStatus: "Authorized Embed",
    status: "Published",
    description: "Diplomatic summits, global trade corridors, and economic realignment across European and Asian markets.",
  },
  {
    title: "Parliamentary Reforms & State Assembly Election Pulse: What Voters Need to Know",
    categorySlug: "politics",
    categoryName: "Politics",
    videoUrl: "https://www.youtube.com/watch?v=Y0CCy_7MkcA",
    externalId: "Y0CCy_7MkcA",
    thumbnailUrl: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=600&h=1000&fit=crop",
    channelTitle: "National Politics Bureau",
    rightsStatus: "Authorized Embed",
    status: "Published",
    description: "Key legislative decisions, statutory committee findings, and governance updates from federal ministries.",
  },
  {
    title: "Central Bank Interest Rate Outlook: Inflation Trends and Equity Market Shifts",
    categorySlug: "business-economy",
    categoryName: "Business & Economy",
    videoUrl: "https://www.youtube.com/watch?v=Y2bf32s2pQc",
    externalId: "Y2bf32s2pQc",
    thumbnailUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=1000&fit=crop",
    channelTitle: "CNBC International",
    rightsStatus: "Authorized Embed",
    status: "Published",
    description: "Macro analysis of sovereign bond yields, currency reserves, and industrial earnings reports.",
  },
  {
    title: "World Cricket Championship & Olympic Athletics: Training Regimens of Top Athletes",
    categorySlug: "sports",
    categoryName: "Sports",
    videoUrl: "https://www.youtube.com/watch?v=sci4PNb_rGc",
    externalId: "sci4PNb_rGc",
    thumbnailUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&h=1000&fit=crop",
    channelTitle: "Global Sports Network",
    rightsStatus: "Authorized Embed",
    status: "Published",
    description: "High performance sports analytics, tournament qualifications, and breaking athletic updates.",
  },
  {
    title: "Cannes and Global Cinema Festival: International Co-productions & Indie Filmmakers",
    categorySlug: "entertainment",
    categoryName: "Entertainment",
    videoUrl: "https://www.youtube.com/watch?v=L_LUpnjgPso",
    externalId: "L_LUpnjgPso",
    thumbnailUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=1000&fit=crop",
    channelTitle: "Entertainment Today",
    rightsStatus: "Authorized Embed",
    status: "Published",
    description: "Behind the scenes with global directors, international streaming releases, and award circuit milestones.",
  },
  {
    title: "Accelerated Approval: First-in-Class Targeted Oncology Therapy for Advanced Solid Tumors",
    categorySlug: "pharmaceutical",
    categoryName: "Pharmaceutical",
    videoUrl: "https://www.youtube.com/watch?v=1zW6w_wX4kE",
    externalId: "1zW6w_wX4kE",
    thumbnailUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=1000&fit=crop",
    channelTitle: "NewsKrez Regulatory Intelligence",
    rightsStatus: "Original AI-Generated",
    status: "Published",
    relatedArticleId: 1,
    description: "Clinical phase III surrogate endpoints, progression-free survival metrics, and companion diagnostics clearance.",
  },
  {
    title: "AI-Powered Autonomous Cardiac Ultrasound Cleared by FDA: 510(k) Clinical Dossier",
    categorySlug: "medical-devices",
    categoryName: "Medical Devices",
    videoUrl: "https://www.youtube.com/watch?v=t5gW_N4sZ6Y",
    externalId: "t5gW_N4sZ6Y",
    thumbnailUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=1000&fit=crop",
    channelTitle: "MedTech Regulatory Review",
    rightsStatus: "Original AI-Generated",
    status: "Published",
    relatedArticleId: 2,
    description: "Real-time computer vision guidance for POCUS echocardiography, predicate device analysis, and ISO 13485 audit.",
  },
  {
    title: "Urgent Class I Recall: Infusion Pump Firmware Sensor Anomalies Requiring Remediation",
    categorySlug: "fda-news",
    categoryName: "FDA News",
    videoUrl: "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
    externalId: "3JZ_D3ELwOQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=1000&fit=crop",
    channelTitle: "FDA Regulatory Desk",
    rightsStatus: "Authorized Embed",
    status: "Published",
    relatedArticleId: 3,
    description: "Class I recall docket details, field safety corrective action notices, and serial number distribution.",
  },
  {
    title: "WHO Avian Influenza Guidance: Surveillance Protocols Across Animal-Human Interfaces",
    categorySlug: "who-healthcare",
    categoryName: "WHO & Healthcare",
    videoUrl: "https://www.youtube.com/watch?v=F4FTVEJsDuI",
    externalId: "F4FTVEJsDuI",
    thumbnailUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=1000&fit=crop",
    channelTitle: "WHO Global Outbreak Alert",
    rightsStatus: "Authorized Embed",
    status: "Published",
    relatedArticleId: 4,
    description: "Zoonotic transmission risk assessment, genomic sequencing protocols, and public health countermeasures.",
  },
  {
    title: "Next-Gen Foundation Models in Chip Design: Autonomous Silicon Architecture",
    categorySlug: "technology",
    categoryName: "Technology",
    videoUrl: "https://www.youtube.com/watch?v=9BxxDVjUCkA",
    externalId: "9BxxDVjUCkA",
    thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=1000&fit=crop",
    channelTitle: "Tech Frontier Intel",
    rightsStatus: "Authorized Embed",
    status: "Published",
    relatedArticleId: 6,
    description: "Sub-2nm semiconductor lithography, automated floorplanning algorithms, and hyperscale data center compute.",
  },
  {
    title: "FDA QMSR Harmonization: 21 CFR Part 820 Transition to ISO 13485:2016 Enforcement",
    categorySlug: "regulatory-intelligence",
    categoryName: "Regulatory Intelligence",
    videoUrl: "https://www.youtube.com/watch?v=Y0CCy_7MkcA",
    externalId: "Y0CCy_7MkcA",
    thumbnailUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&h=1000&fit=crop",
    channelTitle: "GxP Compliance Council",
    rightsStatus: "Original AI-Generated",
    status: "Published",
    relatedArticleId: 5,
    description: "Comparative matrix between legacy QS Regulation and QMSR requirements for medical device manufacturers.",
  },
];

async function main() {
  console.log("Seeding comprehensive curated reels across all categories...");

  // 1. Seed sources and run ingestion
  await runReelsIngestion();

  // 2. Insert curated reels
  for (const item of CURATED_REELS) {
    const slug = `reel-${item.categorySlug}-${item.title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 100)}`;
    const existing = await db.query.reels.findFirst({
      where: eq(schema.reels.slug, slug),
    });

    if (!existing) {
      await db.insert(schema.reels).values({
        title: item.title,
        slug,
        description: item.description,
        videoUrl: item.videoUrl,
        videoType: item.rightsStatus === "Original AI-Generated" ? "ai_generated" : "youtube",
        externalId: item.externalId,
        thumbnailUrl: item.thumbnailUrl,
        durationSeconds: 45,
        aspectRatio: "9:16",
        sourceName: item.channelTitle,
        sourceUrl: item.videoUrl,
        channelTitle: item.channelTitle,
        categorySlug: item.categorySlug,
        categoryName: item.categoryName,
        status: item.status,
        rightsStatus: item.rightsStatus,
        relatedArticleId: item.relatedArticleId || null,
        viewsCount: 0,
        likesCount: 0,
        sharesCount: 0,
        metadata: JSON.stringify({
          embedUrl: `https://www.youtube-nocookie.com/embed/${item.externalId}?autoplay=1&mute=1&playsinline=1&controls=0&loop=1&playlist=${item.externalId}&modestbranding=1&rel=0&enablejsapi=1`,
          scenes: [
            { text: item.title, subtext: item.categoryName.toUpperCase(), bgImage: item.thumbnailUrl },
            { text: item.description, subtext: "KEY INTELLIGENCE HIGHLIGHTS", bgImage: item.thumbnailUrl },
            { text: "Tap to read full dossier and verified documents on NewsKrez.", subtext: item.channelTitle, bgImage: item.thumbnailUrl },
          ],
        }),
        publishedAt: new Date(),
      });
      console.log(`Inserted curated reel: [${item.categoryName}] ${item.title}`);
    }
  }

  const allCount = await db.query.reels.findMany();
  console.log(`Total reels now in database: ${allCount.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  });
