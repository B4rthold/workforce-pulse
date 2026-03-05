/**
 * In-memory diagnostics store for Bright Data integration.
 * Tracks last 10 requests, last error, last snapshot_id.
 * Server-side only.
 */

export interface DiagnosticEntry {
  method: string
  endpoint: string
  status: number
  durationMs: number
  timestamp: string
}

const MAX_ENTRIES = 10
const entries: DiagnosticEntry[] = []
let lastError: string | null = null
let lastSnapshotId: string | null = null
let lastSnapshotStatus: string | null = null

export function logRequest(
  method: string,
  endpoint: string,
  status: number,
  durationMs: number
): void {
  entries.unshift({
    method,
    endpoint,
    status,
    durationMs,
    timestamp: new Date().toISOString(),
  })
  if (entries.length > MAX_ENTRIES) entries.pop()
}

export function logError(err: string): void {
  lastError = err
}

export function logSnapshot(snapshotId: string, status: string): void {
  lastSnapshotId = snapshotId
  lastSnapshotStatus = status
}

export function getDiagnostics(): {
  entries: DiagnosticEntry[]
  lastError: string | null
  lastSnapshotId: string | null
  lastSnapshotStatus: string | null
} {
  return {
    entries: [...entries],
    lastError,
    lastSnapshotId,
    lastSnapshotStatus,
  }
}
