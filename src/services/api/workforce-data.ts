/**
 * Client-side service for aggregated Montgomery workforce data.
 * Calls GET /api/workforce-data which combines JobAps + ArcGIS sources.
 */

import type { WorkforceDataResponse } from "@/app/api/workforce-data/route";

export type { WorkforceDataResponse };

/** Fetch aggregated real workforce data (always live, no stubs). */
export async function fetchWorkforceData(): Promise<WorkforceDataResponse> {
  const res = await fetch("/api/workforce-data");
  if (!res.ok) throw new Error("Failed to fetch workforce data");
  return res.json();
}
