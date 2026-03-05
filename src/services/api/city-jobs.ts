/**
 * Client-side service layer for City of Montgomery job openings.
 * Calls GET /api/city-jobs which fetches the JobAps RSS feed server-side.
 */

import type { CityJob, CityJobsResponse } from "@/app/api/city-jobs/route";

export type { CityJob, CityJobsResponse };

/** Fetch real city job openings from the JobAps RSS feed (via API route). */
export async function fetchCityJobs(): Promise<CityJobsResponse> {
  const res = await fetch("/api/city-jobs");
  if (!res.ok) throw new Error("Failed to fetch city job openings");
  return res.json();
}

/**
 * Returns the count of open city jobs for a given sector.
 * Pass the full CityJobsResponse.bySector map.
 */
export function getCityJobCountForSector(
  bySector: Record<string, number>,
  sectorId: string
): number {
  return bySector[sectorId] ?? 0;
}

/** Returns a flat list of jobs for a given sector ID. */
export function getCityJobsForSector(jobs: CityJob[], sectorId: string): CityJob[] {
  return jobs.filter((j) => j.sectorId === sectorId);
}
