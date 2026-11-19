import { runReelsIngestion } from "../lib/reels/engine";
import { db, schema } from "../db";

async function main() {
  console.log("Seeding and discovering live reels...");
  const res = await runReelsIngestion();
  console.log("Ingestion result:", res);

  const allReels = await db.query.reels.findMany();
  console.log(`Total reels in database: ${allReels.length}`);
  for (const r of allReels.slice(0, 5)) {
    console.log(`- [${r.categoryName}] ${r.title} (${r.status}) - ${r.videoUrl}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  });
