import { NextRequest, NextResponse } from "next/server";
import { NewsIngestionEngine } from "@/lib/ingestion/engine";

export async function GET(req: NextRequest) {
  return handleFetch(req);
}

export async function POST(req: NextRequest) {
  return handleFetch(req);
}

async function handleFetch(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const { searchParams } = new URL(req.url);
  const secretParam = searchParams.get("secret");
  const sourceParam = searchParams.get("source") || undefined;

  const validSecret =
    process.env.CRON_SECRET || "newskrez-cron-trigger-secure-token-99482";

  const isAuthorized =
    authHeader === `Bearer ${validSecret}` || secretParam === validSecret;

  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Unauthorized. Invalid CRON_SECRET token." },
      { status: 401 }
    );
  }

  try {
    const results = await NewsIngestionEngine.runAllSources(sourceParam);
    const totalFetched = results.reduce((acc, r) => acc + r.fetched, 0);
    const totalInserted = results.reduce((acc, r) => acc + r.inserted, 0);
    const totalSkipped = results.reduce((acc, r) => acc + r.skipped, 0);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalFetched,
        totalInserted,
        totalSkipped,
        sourcesProcessed: results.length,
      },
      details: results,
    });
  } catch (error: any) {
    console.error("Cron fetch execution error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute ingestion" },
      { status: 500 }
    );
  }
}
