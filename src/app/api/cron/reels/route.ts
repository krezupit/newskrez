import { NextRequest, NextResponse } from "next/server";
import { runReelsIngestion } from "@/lib/reels/engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleCron(req);
}

export async function POST(req: NextRequest) {
  return handleCron(req);
}

async function handleCron(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const { searchParams } = new URL(req.url);
  const secretParam = searchParams.get("secret");

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
    const startedAt = Date.now();
    const result = await runReelsIngestion();
    const elapsedSeconds = ((Date.now() - startedAt) / 1000).toFixed(2);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      executionTimeSeconds: elapsedSeconds,
      ...result,
    });
  } catch (error: any) {
    console.error("Cron reels error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute reels ingestion" },
      { status: 500 }
    );
  }
}
