"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { loadBrightDataSettings } from "@/lib/settings-store"
import { Loader2, Play, Download } from "lucide-react"

export function CrawlRunner() {
  const [urls, setUrls] = useState("")
  const [snapshotId, setSnapshotId] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("")
  const [output, setOutput] = useState<unknown | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const settings = loadBrightDataSettings()

  const handleRun = async () => {
    const lines = urls
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
    if (lines.length === 0) {
      setError("Enter at least one URL")
      return
    }
    if (!settings.datasetId) {
      setError("Set Dataset ID in Settings first")
      return
    }

    setError(null)
    setOutput(null)
    setLoading(true)
    setStatus("Triggering crawl…")

    try {
      const triggerRes = await fetch("/api/brightdata/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urls: lines,
          datasetId: settings.datasetId,
          includeErrors: settings.includeErrors,
          customOutputFields: settings.customOutputFields || undefined,
        }),
      })

      const triggerData = await triggerRes.json()
      if (!triggerRes.ok) {
        throw new Error(triggerData.error ?? "Trigger failed")
      }

      const sid = triggerData.snapshot_id
      setSnapshotId(sid)
      setStatus("Polling progress…")

      const poll = async () => {
        const progressRes = await fetch(`/api/brightdata/progress/${sid}`)
        const progressData = await progressRes.json()
        if (!progressRes.ok) {
          throw new Error(progressData.error ?? "Progress failed")
        }
        const s = progressData.status as string
        setStatus(`Status: ${s}`)
        if (s === "ready") {
          const snapRes = await fetch(
            `/api/brightdata/snapshot/${sid}?format=${settings.downloadFormat}`
          )
          const snapData = await snapRes.json()
          if (!snapRes.ok) {
            throw new Error(snapData.error ?? "Download failed")
          }
          setOutput(snapData)
          setStatus("Ready")
          setLoading(false)
          return
        }
        if (s === "failed") {
          throw new Error("Snapshot failed")
        }
        setTimeout(poll, 5000)
      }

      await poll()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!output) return
    const blob = new Blob([JSON.stringify(output, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `snapshot-${snapshotId ?? "data"}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crawl Runner</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter URLs (one per line), then run. Requires Dataset ID in Settings.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="urls">URLs</Label>
          <Textarea
            id="urls"
            placeholder={"https://example.com\nhttps://example.org"}
            rows={6}
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            disabled={loading}
            className="font-mono text-sm"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleRun} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Run
          </Button>
        {output != null && (
          <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
        </div>

        {status && (
          <div className="text-sm text-muted-foreground">
            {status}
          </div>
        )}

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {output != null && (
          <div className="rounded-md border p-3 max-h-64 overflow-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap break-words">
              {JSON.stringify(
                Array.isArray(output) ? output.slice(0, 5) : output,
                null,
                2
              )}
              {Array.isArray(output) && output.length > 5
                ? `\n... (${output.length - 5} more)`
                : ""}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
