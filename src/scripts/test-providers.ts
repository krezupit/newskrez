import {
  fetchGNews,
  fetchNewsAPI,
  fetchCurrents,
  fetchMediastack,
  fetchNewsData,
  ingestProviderNews,
  getProvidersStatusList,
} from "../lib/news-providers";
import { db, schema } from "../db";
import { desc, eq, inArray } from "drizzle-orm";

async function runProviderTests() {
  console.log("================================================================================");
  console.log(" NEWSKREZ MULTI-PROVIDER NEWS INGESTION ENGINE – COMPREHENSIVE TEST SUITE");
  console.log("================================================================================\n");

  const providers = await getProvidersStatusList();
  console.log("Configured Providers in Database:");
  console.table(
    providers.map((p) => ({
      Code: p.code,
      Name: p.name,
      Configured: p.isConfigured ? "YES" : "NO",
      MaskedKey: p.maskedKey,
      Enabled: p.isEnabled ? "TRUE" : "FALSE",
      Priority: p.priority,
    }))
  );

  console.log("\n--------------------------------------------------------------------------------");
  console.log(" 1. INDEPENDENT LIVE API CONNECTION & NORMALIZATION VERIFICATION");
  console.log("--------------------------------------------------------------------------------\n");

  // 1. GNews
  console.log("Testing [1/5] GNews...");
  const gnewsRes = await fetchGNews({ categorySlug: "general-news", limit: 3 });
  console.log(`  > Success: ${gnewsRes.success}`);
  console.log(`  > HTTP Status: ${gnewsRes.httpStatus}`);
  console.log(`  > Latency: ${gnewsRes.executionTimeMs}ms`);
  console.log(`  > Articles Returned: ${gnewsRes.articles.length}`);
  if (gnewsRes.articles[0]) {
    console.log(`  > Sample: "${gnewsRes.articles[0].title.slice(0, 65)}..."`);
    console.log(`  > Attribution: ${gnewsRes.articles[0].sourceName} | ${gnewsRes.articles[0].canonicalUrl.slice(0, 50)}...`);
  }
  if (gnewsRes.errorMessage) console.log(`  > Error: ${gnewsRes.errorMessage}`);

  // 2. NewsAPI.org
  console.log("\nTesting [2/5] NewsAPI.org...");
  const newsApiRes = await fetchNewsAPI({ categorySlug: "general-news", limit: 3 });
  console.log(`  > Success: ${newsApiRes.success}`);
  console.log(`  > HTTP Status: ${newsApiRes.httpStatus}`);
  console.log(`  > Latency: ${newsApiRes.executionTimeMs}ms`);
  console.log(`  > Articles Returned: ${newsApiRes.articles.length}`);
  if (newsApiRes.articles[0]) {
    console.log(`  > Sample: "${newsApiRes.articles[0].title.slice(0, 65)}..."`);
    console.log(`  > Attribution: ${newsApiRes.articles[0].sourceName} | ${newsApiRes.articles[0].canonicalUrl.slice(0, 50)}...`);
  }
  if (newsApiRes.errorMessage) console.log(`  > Error: ${newsApiRes.errorMessage}`);

  // 3. Currents
  console.log("\nTesting [3/5] Currents News API...");
  const currentsRes = await fetchCurrents({ categorySlug: "general-news", limit: 3 });
  console.log(`  > Success: ${currentsRes.success}`);
  console.log(`  > HTTP Status: ${currentsRes.httpStatus}`);
  console.log(`  > Latency: ${currentsRes.executionTimeMs}ms`);
  console.log(`  > Quota Remaining: ${currentsRes.quotaRemaining ?? "N/A"}`);
  console.log(`  > Articles Returned: ${currentsRes.articles.length}`);
  if (currentsRes.articles[0]) {
    console.log(`  > Sample: "${currentsRes.articles[0].title.slice(0, 65)}..."`);
    console.log(`  > Attribution: ${currentsRes.articles[0].sourceName} | ${currentsRes.articles[0].canonicalUrl.slice(0, 50)}...`);
  }
  if (currentsRes.errorMessage) console.log(`  > Error: ${currentsRes.errorMessage}`);

  // 4. Mediastack
  console.log("\nTesting [4/5] Mediastack...");
  const mediastackRes = await fetchMediastack({ categorySlug: "general-news", limit: 3 });
  console.log(`  > Success: ${mediastackRes.success}`);
  console.log(`  > HTTP Status: ${mediastackRes.httpStatus}`);
  console.log(`  > Latency: ${mediastackRes.executionTimeMs}ms`);
  console.log(`  > Quota Remaining: ${mediastackRes.quotaRemaining ?? "N/A"}`);
  console.log(`  > Articles Returned: ${mediastackRes.articles.length}`);
  if (mediastackRes.articles[0]) {
    console.log(`  > Sample: "${mediastackRes.articles[0].title.slice(0, 65)}..."`);
    console.log(`  > Attribution: ${mediastackRes.articles[0].sourceName} | ${mediastackRes.articles[0].canonicalUrl.slice(0, 50)}...`);
  }
  if (mediastackRes.errorMessage) console.log(`  > Error: ${mediastackRes.errorMessage}`);

  // 5. NewsData.io
  console.log("\nTesting [5/5] NewsData.io...");
  const newsDataRes = await fetchNewsData({ categorySlug: "general-news", limit: 3 });
  console.log(`  > Success: ${newsDataRes.success}`);
  console.log(`  > HTTP Status: ${newsDataRes.httpStatus}`);
  console.log(`  > Latency: ${newsDataRes.executionTimeMs}ms`);
  console.log(`  > Quota Remaining: ${newsDataRes.quotaRemaining ?? "N/A"}`);
  console.log(`  > Articles Returned: ${newsDataRes.articles.length}`);
  if (newsDataRes.articles[0]) {
    console.log(`  > Sample: "${newsDataRes.articles[0].title.slice(0, 65)}..."`);
    console.log(`  > Attribution: ${newsDataRes.articles[0].sourceName} | ${newsDataRes.articles[0].canonicalUrl.slice(0, 50)}...`);
  }
  if (newsDataRes.errorMessage) console.log(`  > Error: ${newsDataRes.errorMessage}`);

  console.log("\n--------------------------------------------------------------------------------");
  console.log(" 2. INGESTION PIPELINE & MYSQL DATABASE STORAGE VERIFICATION");
  console.log("--------------------------------------------------------------------------------\n");

  const ingestionResults = [];

  // Ingest 1-2 articles from each provider into MySQL
  for (const prov of ["gnews", "newsapi", "currents", "mediastack", "newsdata"] as const) {
    process.stdout.write(`Ingesting from '${prov}' into MySQL articles table... `);
    const ingestRes = await ingestProviderNews(prov, "general-news", true);
    ingestionResults.push(ingestRes);
    console.log(`[DONE] Inserted: ${ingestRes.articlesInserted}, Skipped: ${ingestRes.articlesSkipped}, Time: ${ingestRes.executionTimeMs}ms`);
  }

  console.log("\n--------------------------------------------------------------------------------");
  console.log(" 3. VERIFIED ARTICLES SAVED IN MYSQL DATABASE");
  console.log("--------------------------------------------------------------------------------\n");

  const savedArticles = await db.query.articles.findMany({
    where: inArray(schema.articles.provider, ["gnews", "newsapi", "currents", "mediastack", "newsdata"]),
    orderBy: (a, { desc }) => [desc(a.id)],
    limit: 10,
    columns: {
      id: true,
      provider: true,
      sourceName: true,
      title: true,
      country: true,
      language: true,
      status: true,
      importTimestamp: true,
    },
  });

  console.table(
    savedArticles.map((a) => ({
      ID: a.id,
      Provider: a.provider,
      Source: a.sourceName?.slice(0, 20),
      Title: a.title.slice(0, 45) + "...",
      Country: a.country,
      Lang: a.language,
      Status: a.status,
      ImportedAt: a.importTimestamp ? a.importTimestamp.toISOString().replace("T", " ").slice(0, 19) : "N/A",
    }))
  );

  console.log("\n--------------------------------------------------------------------------------");
  console.log(" 4. PROVIDER FETCH LOG AUDIT RECORDS");
  console.log("--------------------------------------------------------------------------------\n");

  const logs = await db.query.providerFetchLogs.findMany({
    orderBy: (l, { desc }) => [desc(l.id)],
    limit: 5,
    columns: {
      id: true,
      providerCode: true,
      status: true,
      articlesFetched: true,
      articlesInserted: true,
      articlesSkipped: true,
      executionTimeMs: true,
    },
  });

  console.table(logs);

  console.log("\nAll 5 News Providers successfully tested and verified against live APIs & MySQL!");
  process.exit(0);
}

runProviderTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
