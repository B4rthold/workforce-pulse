/**
 * Bright Data Web Scraper APIs client
 *
 * Trigger → poll → download pattern:
 *  1. POST /trigger  → returns { snapshot_id }
 *  2. GET  /progress/{snapshot_id} → poll until status === "ready"
 *  3. GET  /snapshot/{snapshot_id} → returns the scraped records
 *
 * Re-exports from integrations/brightdata for backward compatibility.
 * Enhanced client with retry, backoff, and correct API paths per docs.
 */

import {
  triggerCrawl,
  waitForSnapshot as waitForSnapshotNew,
  downloadSnapshot as downloadSnapshotNew,
} from "@/integrations/brightdata/brightdataClient";
import type { BDTriggerResult, BDProgressResult, BDSnapshotStatus } from "@/integrations/brightdata/types";

export type { BDSnapshotStatus, BDTriggerResult, BDProgressResult };

/** Normalize inputs to URL format for the Crawl API */
function toUrlInputs(inputs: Record<string, string>[]): { url: string }[] {
  return inputs.map((o) => ({
    url: o.url ?? o.URL ?? Object.values(o)[0] ?? "",
  })).filter((o) => o.url);
}

/** Trigger a dataset scrape job. Returns a snapshot_id to poll with. */
export async function triggerScrape(
  datasetId: string,
  inputs: Record<string, string>[],
  options?: { includeErrors?: boolean; customOutputFields?: string }
): Promise<BDTriggerResult> {
  const urls = toUrlInputs(inputs);
  if (urls.length === 0) {
    throw new Error("At least one URL input is required");
  }
  return triggerCrawl(urls, {
    datasetId,
    includeErrors: options?.includeErrors ?? true,
    customOutputFields: options?.customOutputFields,
  });
}

/** Poll a snapshot until it is ready. Times out after maxWaitMs (default 5 min). */
export async function waitForSnapshot(
  snapshotId: string,
  maxWaitMs = 300_000,
  pollIntervalMs = 5_000,
  signal?: AbortSignal
): Promise<void> {
  await waitForSnapshotNew(snapshotId, {
    maxWaitMs,
    pollIntervalMs,
    signal,
  });
}

/** Download the results of a completed snapshot as a typed array. */
export async function downloadSnapshot<T = Record<string, unknown>>(
  snapshotId: string,
  format: "json" | "ndjson" | "jsonl" | "csv" = "json"
): Promise<T[]> {
  const result = await downloadSnapshotNew<T>(snapshotId, { format });
  if (Array.isArray(result)) return result;
  return [];
}

/**
 * Convenience: trigger → wait → download in one call.
 * Use only in long-running server contexts (API routes, not edge functions).
 */
export async function scrapeAndDownload<T = Record<string, unknown>>(
  datasetId: string,
  inputs: Record<string, string>[],
  maxWaitMs = 300_000
): Promise<T[]> {
  const urls = toUrlInputs(inputs);
  if (urls.length === 0) {
    throw new Error("At least one URL input is required");
  }
  const { snapshot_id } = await triggerCrawl(urls, { datasetId, includeErrors: true });
  await waitForSnapshotNew(snapshot_id, { maxWaitMs });
  const data = await downloadSnapshotNew<T>(snapshot_id, { format: "json" });
  return Array.isArray(data) ? data : [];
}
