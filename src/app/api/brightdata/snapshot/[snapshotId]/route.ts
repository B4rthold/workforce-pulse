/**
 * GET /api/brightdata/snapshot/[snapshotId]
 * Proxy to Bright Data snapshot download.
 * Query: format, compress, batch_size, part
 */

import { NextRequest, NextResponse } from "next/server";
import { downloadSnapshot } from "@/integrations/brightdata/brightdataClient";

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

  const { searchParams } = new URL(req.url);
  const format = (searchParams.get("format") ?? "json") as "json" | "ndjson" | "jsonl" | "csv";
  const compress = searchParams.get("compress") === "true";
  const batchSize = searchParams.get("batch_size");
  const part = searchParams.get("part");

  try {
    const result = await downloadSnapshot(snapshotId, {
      format,
      compress,
      batchSize: batchSize ? parseInt(batchSize, 10) : undefined,
      part: part ? parseInt(part, 10) : undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
