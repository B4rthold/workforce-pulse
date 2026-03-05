/**
 * POST /api/brightdata/trigger
 * Proxy to Bright Data Crawl API trigger.
 * Body: { urls: string[]; datasetId: string; includeErrors?: boolean; customOutputFields?: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { triggerCrawl } from "@/integrations/brightdata/brightdataClient";
import { logRequest, logError, logSnapshot } from "@/lib/brightdata-diagnostics";

export async function POST(req: NextRequest) {
  const start = Date.now();
  const apiKey = process.env.BRIGHT_DATA_API_KEY ?? "";
  if (!apiKey) {
    return NextResponse.json(
      { error: "BRIGHT_DATA_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const urls = Array.isArray(body.urls)
      ? body.urls.filter((u: unknown) => typeof u === "string")
      : [];
    const datasetId = typeof body.datasetId === "string" ? body.datasetId : "";

    if (urls.length === 0 || !datasetId) {
      return NextResponse.json(
        { error: "urls (string[]) and datasetId are required" },
        { status: 400 }
      );
    }

    const urlObjects = urls.map((u: string) => ({ url: u.trim() })).filter((o: { url: string }) => o.url);
    const result = await triggerCrawl(urlObjects, {
      datasetId,
      includeErrors: body.includeErrors ?? true,
      customOutputFields: body.customOutputFields,
    });
    logRequest("POST", "/api/brightdata/trigger", 200, Date.now() - start);
    if (result.snapshot_id) {
      logSnapshot(result.snapshot_id, "triggered");
    }
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logRequest("POST", "/api/brightdata/trigger", 500, Date.now() - start);
    logError(msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
