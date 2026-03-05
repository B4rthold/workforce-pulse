"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { loadBrightDataSettings } from "@/lib/settings-store"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface SnapshotItem {
  id?: string
  snapshot_id?: string
  status?: string
  created?: string
  dataset_id?: string
}

async function fetchSnapshots(datasetId: string): Promise<SnapshotItem[]> {
  const res = await fetch(`/api/brightdata/snapshots?dataset_id=${encodeURIComponent(datasetId)}&limit=20`)
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error ?? "Failed to fetch snapshots")
  }
  const data = await res.json()
  return Array.isArray(data) ? data : data.snapshots ?? data.data ?? []
}

export function SnapshotsList() {
  const settings = loadBrightDataSettings()

  const { data: snapshots, isLoading, error } = useQuery({
    queryKey: ["brightdata-snapshots", settings.datasetId],
    queryFn: () => fetchSnapshots(settings.datasetId),
    enabled: !!settings.datasetId,
  })

  if (!settings.datasetId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Snapshots</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Set Dataset ID in Settings to view snapshots.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Snapshots</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Snapshots</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load"}
          </p>
        </CardContent>
      </Card>
    )
  }

  const items = snapshots ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Snapshots</CardTitle>
        <p className="text-sm text-muted-foreground">
          Dataset: {settings.datasetId}
        </p>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No snapshots found.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((s) => {
              const id = s.snapshot_id ?? s.id ?? ""
              const status = s.status ?? "unknown"
              return (
                <li
                  key={id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <code className="font-mono text-xs">{id}</code>
                  <Badge variant={status === "ready" ? "default" : "secondary"}>
                    {status}
                  </Badge>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
