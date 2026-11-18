process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { NewsIngestionEngine } from "../lib/ingestion/engine";

async function main() {
  console.log("🚀 Testing NewsKrez Ingestion Engine live...");
  const results = await NewsIngestionEngine.runAllSources();
  console.log("Results summary:");
  for (const r of results) {
    console.log(`- [${r.sourceCode}] status: ${r.status}, fetched: ${r.fetched}, inserted: ${r.inserted}, skipped: ${r.skipped} (${r.executionTimeMs}ms)`);
    if (r.errorMessage) {
      console.log(`  Error: ${r.errorMessage}`);
    }
  }
  process.exit(0);
}

main().catch((e) => {
  console.error("Fatal fetch test error:", e);
  process.exit(1);
});
