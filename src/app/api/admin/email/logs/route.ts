import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "30", 10);
    const status = searchParams.get("status");

    let logs;
    if (status && ["sent", "failed", "rate_limited"].includes(status)) {
      logs = await db.query.emailLogs.findMany({
        where: eq(schema.emailLogs.status, status as any),
        orderBy: [desc(schema.emailLogs.sentAt)],
        limit,
      });
    } else {
      logs = await db.query.emailLogs.findMany({
        orderBy: [desc(schema.emailLogs.sentAt)],
        limit,
      });
    }

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error: any) {
    console.error("Error fetching email logs:", error);
    return NextResponse.json(
      { error: "Failed to load email logs", details: error.message },
      { status: 500 }
    );
  }
}
