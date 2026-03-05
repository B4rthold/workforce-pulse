/**
 * Bright Data Crawl API / Dataset API types
 * Docs: https://docs.brightdata.com/api-reference/rest-api/scraper/crawl-api
 *       https://docs.brightdata.com/api-reference/web-scraper-api/management-apis/monitor-progress
 *       https://docs.brightdata.com/api-reference/web-scraper-api/delivery-apis/download-snapshot
 */

export type BDSnapshotStatus =
  | "starting"
  | "running"
  | "ready"
  | "failed";

export interface BDTriggerResult {
  snapshot_id: string;
}

export interface BDProgressResult {
  snapshot_id?: string;
  dataset_id?: string;
  status: BDSnapshotStatus;
  records?: number;
}

export type BDDownloadFormat = "json" | "ndjson" | "jsonl" | "csv";

export interface BDTriggerOptions {
  datasetId: string;
  includeErrors?: boolean;
  customOutputFields?: string; // pipe-separated, e.g. "markdown|ld_json|html"
}

export interface BDPollOptions {
  maxWaitMs?: number;
  pollIntervalMs?: number;
  signal?: AbortSignal;
}

export interface BDDownloadOptions {
  format?: BDDownloadFormat;
  compress?: boolean;
  batchSize?: number;
  part?: number;
}

export interface BrightDataConfig {
  apiKey: string;
  datasetId: string;
  includeErrors?: boolean;
  customOutputFields?: string;
}
