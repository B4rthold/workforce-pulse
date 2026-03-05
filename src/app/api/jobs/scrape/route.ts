/**
 * POST /api/jobs/scrape
 *   Scrapes Indeed job listings for Montgomery, AL using Bright Data
 *   Scraping Browser (Playwright over CDP).
 *
 *   Runs synchronously — connects to the remote browser, scrapes all
 *   configured queries, normalizes results, stores them, and returns insights.
 *
 *   Body (optional):
 *     { queries?: { keyword: string; location: string }[] }
 *
 *   Returns: { jobs: number; insights: JobInsights; durationMs: number }
 *
 * GET /api/jobs/scrape
 *   Returns the current job store state (count + cached insights).
 */

import { NextRequest, NextResponse } from "next/server";
import { scrapeIndeedJobs, DEFAULT_SCRAPE_QUERIES } from "@/lib/scraper";
import { normalizeIndeedRecord, deriveInsights } from "@/lib/job-processing";
import type { RawIndeedRecord } from "@/lib/job-processing";
import { jobStore } from "../store";

// Allow up to 120s — scraping 7 queries takes ~60-90s
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  // Allow caller to override queries (e.g. for a focused single-sector scrape)
  const queries: { keyword: string; location: string }[] =
    body.queries ?? DEFAULT_SCRAPE_QUERIES;

  try {
    const result = await scrapeIndeedJobs(queries);

    // Normalize raw scraped records into JobPosting shape
    const postings = result.jobs.map((raw) =>
      normalizeIndeedRecord(raw as unknown as RawIndeedRecord)
    );

    // Upsert into in-process store (dedupes by id)
    for (const posting of postings) {
      jobStore.upsert(posting);
    }

    // Derive and cache insights
    const insights = deriveInsights(jobStore.getAll());
    jobStore.setInsights(insights);

    return NextResponse.json({
      jobs: postings.length,
      totalStored: jobStore.count(),
      queriesRun: result.queriesRun,
      queriesFailed: result.queriesFailed,
      durationMs: result.durationMs,
      insights,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    count: jobStore.count(),
    insights: jobStore.getInsights(),
  });
}
