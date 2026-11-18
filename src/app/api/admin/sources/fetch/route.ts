import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { NewsIngestionEngine } from "@/lib/ingestion/engine";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const sourceCode = body.sourceCode || undefined;

    const results = await NewsIngestionEngine.runAllSources(sourceCode);
    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("Admin source fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to trigger ingestion" },
      { status: 500 }
    );
  }
}
