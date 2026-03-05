/**
 * GET /api/jobs
 *   Returns cached JobInsights derived from all aggregated postings.
 *   If store is empty, triggers background aggregate (fire-and-forget).
 *
 * DELETE /api/jobs
 *   Clears the in-process job store (useful for dev/demo resets).
 */

import { NextResponse } from "next/server";
import { jobStore } from "./store";
import { aggregateJobs } from "@/lib/job-aggregator";

// Stale threshold: if no data or last aggregate was >6h ago, trigger background aggregate
const STALE_MS = 6 * 60 * 60 * 1000;
let lastAggregateAt = 0;

export async function GET() {
  const count = jobStore.count();
  const insights = jobStore.getInsights();

  // Auto-trigger aggregate: if empty, await quick aggregate (JobAps + USAJOBS).
  // If stale, fire-and-forget background refresh.
  const now = Date.now();
  const isStale = now - lastAggregateAt > STALE_MS;

  if (count === 0) {
    lastAggregateAt = now;
    try {
      await aggregateJobs({ includeIndeed: false });
    } catch {
      // Return empty on error
    }
  } else if (isStale) {
    lastAggregateAt = now;
    aggregateJobs({ includeIndeed: false }).catch(() => {});
  }

  return NextResponse.json({
    count: jobStore.count(),
    insights: jobStore.getInsights() ?? insights,
  });
}

export async function DELETE() {
  jobStore.clear();
  return NextResponse.json({ cleared: true });
}
