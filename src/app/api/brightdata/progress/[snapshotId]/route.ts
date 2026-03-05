/**
 * GET /api/brightdata/progress/[snapshotId]
 * Proxy to Bright Data progress endpoint.
 */

import { NextRequest, NextResponse } from "next/server";
import { getProgress } from "@/integrations/brightdata/brightdataClient";
import { logRequest, logError, logSnapshot } from "@/lib/brightdata-diagnostics";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ snapshotId: string }> }
) {
  const apiKey = process.env.BRIGHT_DATA_API_KEY ?? "";
  if (!apiKey) {
    return NextResponse.json(
      { error: "BRIGHT_DATA_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const { snapshotId } = await params;
  if (!snapshotId) {
    return NextResponse.json({ error: "snapshotId required" }, { status: 400 });
  }

  const start = Date.now();
  try {
    const result = await getProgress(snapshotId);
    logRequest("GET", `/api/brightdata/progress/${snapshotId}`, 200, Date.now() - start);
    if (result.status) {
      logSnapshot(snapshotId, result.status);
    }
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logRequest("GET", `/api/brightdata/progress/${snapshotId}`, 500, Date.now() - start);
    logError(msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
