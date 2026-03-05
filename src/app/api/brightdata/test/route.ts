/**
 * POST /api/brightdata/test
 * Validates BRIGHT_DATA_API_KEY by calling GET /datasets/list (harmless).
 * Body: { datasetId?, includeErrors?, customOutputFields? } — optional, used if we add dataset validation.
 */

import { NextResponse } from "next/server";
import { logRequest, logError } from "@/lib/brightdata-diagnostics";

const BD_BASE = "https://api.brightdata.com";

export async function POST() {
  const start = Date.now();
  const apiKey = process.env.BRIGHT_DATA_API_KEY ?? "";
  if (!apiKey) {
    logRequest("POST", "/api/brightdata/test", 500, Date.now() - start);
    logError("BRIGHT_DATA_API_KEY is not configured");
    return NextResponse.json(
      { error: "BRIGHT_DATA_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(`${BD_BASE}/datasets/list`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      const text = await res.text();
      logRequest("POST", "/api/brightdata/test", 401, Date.now() - start);
      logError(`Bright Data auth failed (${res.status}): ${text}`);
      return NextResponse.json(
        { error: `Bright Data auth failed (${res.status}): ${text}` },
        { status: 401 }
      );
    }

    logRequest("POST", "/api/brightdata/test", 200, Date.now() - start);
    return NextResponse.json({
      message: "Bright Data API key is valid.",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logRequest("POST", "/api/brightdata/test", 500, Date.now() - start);
    logError(msg);
    return NextResponse.json(
      { error: `Test failed: ${msg}` },
      { status: 500 }
    );
  }
}
