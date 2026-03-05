/**
 * GET /api/brightdata/diagnostics
 * Returns last 10 requests, last error, last snapshot_id + status.
 */

import { NextResponse } from "next/server";
import { getDiagnostics } from "@/lib/brightdata-diagnostics";

export async function GET() {
  const diag = getDiagnostics();
  return NextResponse.json(diag);
}
