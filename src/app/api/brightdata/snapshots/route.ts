/**
 * GET /api/brightdata/snapshots
 * Lists snapshots for a dataset. Query: dataset_id, limit, skip, status, etc.
 */

import { NextRequest, NextResponse } from "next/server";

const BD_BASE = "https://api.brightdata.com/datasets/v3";

export async function GET(req: NextRequest) {
  const apiKey = process.env.BRIGHT_DATA_API_KEY ?? "";
  if (!apiKey) {
    return NextResponse.json(
      { error: "BRIGHT_DATA_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const datasetId = searchParams.get("dataset_id");
  if (!datasetId) {
    return NextResponse.json(
      { error: "dataset_id query param is required" },
      { status: 400 }
    );
  }

  const params = new URLSearchParams({ dataset_id: datasetId });
  const limit = searchParams.get("limit");
  const skip = searchParams.get("skip");
  const status = searchParams.get("status");
  if (limit) params.set("limit", limit);
  if (skip) params.set("skip", skip);
  if (status) params.set("status", status);

  try {
    const res = await fetch(`${BD_BASE}/snapshots?${params}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Bright Data snapshots failed (${res.status}): ${text}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
