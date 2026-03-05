/**
 * Bright Data Crawl API client — typed, with retry, backoff, and AbortController support.
 * Server-side only. Uses BRIGHT_DATA_API_KEY from env.
 */

import type {
  BDTriggerResult,
  BDProgressResult,
  BDSnapshotStatus,
  BDTriggerOptions,
  BDPollOptions,
  BDDownloadOptions,
  BDDownloadFormat,
} from "./types";

const BD_BASE = "https://api.brightdata.com/datasets/v3";

function getApiKey(): string {
  const key = process.env.BRIGHT_DATA_API_KEY ?? "";
  if (!key) throw new Error("BRIGHT_DATA_API_KEY is not set");
  return key;
}

function headers(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

/** Exponential backoff with jitter for polling. */
function backoffDelay(attempt: number, baseMs: number, capMs: number): number {
  const exp = Math.min(2 ** attempt, capMs / baseMs);
  const jitter = 0.5 + Math.random() * 0.5;
  return Math.min(baseMs * exp * jitter, capMs);
}

/** Trigger a crawl. POST /datasets/v3/trigger */
export async function triggerCrawl(
  urls: { url: string }[],
  opts: BDTriggerOptions
): Promise<BDTriggerResult> {
  const apiKey = getApiKey();
  const params = new URLSearchParams({
    dataset_id: opts.datasetId,
    include_errors: String(opts.includeErrors ?? true),
  });
  if (opts.customOutputFields) {
    params.set("custom_output_fields", opts.customOutputFields);
  }

  const res = await fetch(`${BD_BASE}/trigger?${params}`, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify(urls),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bright Data trigger failed (${res.status}): ${text}`);
  }

  return res.json();
}

/** Get progress. GET /datasets/v3/progress/{snapshot_id} */
export async function getProgress(
  snapshotId: string
): Promise<BDProgressResult> {
  const apiKey = getApiKey();
  const res = await fetch(`${BD_BASE}/progress/${snapshotId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bright Data progress failed (${res.status}): ${text}`);
  }

  return res.json();
}

/** Poll until ready or failed. Uses exponential backoff and respects AbortController. */
export async function waitForSnapshot(
  snapshotId: string,
  opts: BDPollOptions = {}
): Promise<BDProgressResult> {
  const {
    maxWaitMs = 600_000, // 10 min default
    pollIntervalMs = 5000,
    signal,
  } = opts;

  const deadline = Date.now() + maxWaitMs;
  let attempt = 0;

  while (Date.now() < deadline) {
    if (signal?.aborted) {
      throw new Error("Polling aborted");
    }

    const progress = await getProgress(snapshotId);
    const status = progress.status as BDSnapshotStatus;

    if (status === "ready") {
      return progress;
    }
    if (status === "failed") {
      throw new Error(`Bright Data snapshot ${snapshotId} failed`);
    }

    const delay = backoffDelay(attempt, pollIntervalMs, 30_000);
    attempt++;
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(resolve, delay);
      signal?.addEventListener?.("abort", () => {
        clearTimeout(t);
        reject(new DOMException("Polling aborted", "AbortError"));
      }, { once: true });
    });
  }

  throw new Error(
    `Bright Data snapshot ${snapshotId} timed out after ${maxWaitMs}ms`
  );
}

/** Download snapshot content. GET /datasets/v3/snapshot/{snapshot_id} */
export async function downloadSnapshot<T = Record<string, unknown>>(
  snapshotId: string,
  downloadOpts: BDDownloadOptions = {}
): Promise<T[] | string> {
  const apiKey = getApiKey();
  const params = new URLSearchParams();
  const format = downloadOpts.format ?? "json";
  params.set("format", format);
  if (downloadOpts.compress != null) {
    params.set("compress", String(downloadOpts.compress));
  }
  if (downloadOpts.batchSize != null && downloadOpts.batchSize >= 1000) {
    params.set("batch_size", String(downloadOpts.batchSize));
  }
  if (downloadOpts.part != null) {
    params.set("part", String(downloadOpts.part));
  }

  const res = await fetch(
    `${BD_BASE}/snapshot/${snapshotId}?${params}`,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );

  if (res.status === 202) {
    throw new Error("Snapshot not ready yet. Keep polling progress.");
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bright Data download failed (${res.status}): ${text}`);
  }

  const text = await res.text();

  if (format === "csv") {
    return text;
  }

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed as T[];
    return [parsed] as T[];
  } catch {
    return text
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as T);
  }
}

/** Full flow: trigger → poll → download */
export async function scrapeAndDownload<T = Record<string, unknown>>(
  urls: { url: string }[],
  opts: BDTriggerOptions & BDPollOptions & { downloadFormat?: BDDownloadFormat }
): Promise<T[]> {
  const { downloadFormat = "json", ...triggerOpts } = opts;
  const { snapshot_id } = await triggerCrawl(urls, triggerOpts);
  await waitForSnapshot(snapshot_id, triggerOpts);
  const result = await downloadSnapshot<T>(snapshot_id, {
    format: downloadFormat,
  });
  return Array.isArray(result) ? result : [];
}
