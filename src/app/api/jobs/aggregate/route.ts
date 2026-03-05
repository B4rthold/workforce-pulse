/**
 * POST /api/jobs/aggregate
 *   Automatically fetches jobs from JobAps, USAJOBS, and optionally Indeed.
 *   Populates the job store. No manual crawl needed.
 *
 * GET /api/jobs/aggregate
 *   Same as POST — allows cron to trigger via GET.
 *
 * Optional query/body: ?includeIndeed=true to run Indeed scrape (60-90s).
 */

import { NextRequest, NextResponse } from "next/server";
import { aggregateJobs } from "@/lib/job-aggregator";

// Allow up to 120s if Indeed is included
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const includeIndeed = body.includeIndeed ?? true;
    const result = await aggregateJobs({ includeIndeed });
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeIndeed = searchParams.get("includeIndeed") !== "false";
    const result = await aggregateJobs({ includeIndeed });
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
