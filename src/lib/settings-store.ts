/**
 * Client-side settings storage for integrations.
 * Uses localStorage under a single namespace.
 */

const STORAGE_KEY = "settings.integrations.brightdata";

export interface BrightDataSettings {
  datasetId: string;
  customOutputFields: string;
  includeErrors: boolean;
  downloadFormat: "json" | "ndjson" | "jsonl" | "csv";
}

const DEFAULTS: BrightDataSettings = {
  datasetId: "",
  customOutputFields: "markdown|html|ld_json",
  includeErrors: true,
  downloadFormat: "json",
};

export function loadBrightDataSettings(): BrightDataSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<BrightDataSettings>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveBrightDataSettings(settings: Partial<BrightDataSettings>): void {
  if (typeof window === "undefined") return;
  try {
    const current = loadBrightDataSettings();
    const merged = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // ignore
  }
}
