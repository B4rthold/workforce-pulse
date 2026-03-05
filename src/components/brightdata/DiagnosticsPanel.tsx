"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

async function fetchDiagnostics() {
  const res = await fetch("/api/brightdata/diagnostics")
  if (!res.ok) throw new Error("Failed to fetch diagnostics")
  return res.json()
}

export function DiagnosticsPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ["brightdata-diagnostics"],
    queryFn: fetchDiagnostics,
    refetchInterval: 5000,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Diagnostics</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  const entries = data?.entries ?? []
  const lastError = data?.lastError ?? null
  const lastSnapshotId = data?.lastSnapshotId ?? null
  const lastSnapshotStatus = data?.lastSnapshotStatus ?? null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Integration Diagnostics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        {lastError && (
          <div>
            <span className="font-medium text-destructive">Last error:</span>{" "}
            {lastError}
          </div>
        )}
        {lastSnapshotId && (
          <div>
            <span className="font-medium">Last snapshot:</span>{" "}
            <code className="font-mono">{lastSnapshotId}</code>{" "}
            {lastSnapshotStatus && (
              <span className="text-muted-foreground">({lastSnapshotStatus})</span>
            )}
          </div>
        )}
        {entries.length > 0 && (
          <div>
            <span className="font-medium">Recent requests:</span>
            <ul className="mt-1 space-y-0.5 font-mono text-[10px]">
              {entries.slice(0, 5).map((e: { method: string; endpoint: string; status: number; durationMs: number }, i: number) => (
                <li key={i}>
                  {e.method} {e.endpoint} → {e.status} ({e.durationMs}ms)
                </li>
              ))}
            </ul>
          </div>
        )}
        {!lastError && !lastSnapshotId && entries.length === 0 && (
          <p className="text-muted-foreground">No activity yet.</p>
        )}
      </CardContent>
    </Card>
  )
}
