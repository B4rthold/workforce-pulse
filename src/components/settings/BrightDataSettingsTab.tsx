"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  loadBrightDataSettings,
  saveBrightDataSettings,
  type BrightDataSettings,
} from "@/lib/settings-store"
import { Loader2, ExternalLink } from "lucide-react"

export function BrightDataSettingsTab() {
  const [settings, setSettings] = useState<BrightDataSettings | null>(null)
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [testMessage, setTestMessage] = useState("")

  useEffect(() => {
    setSettings(loadBrightDataSettings())
  }, [])

  const handleSave = () => {
    if (!settings) return
    saveBrightDataSettings(settings)
    setTestMessage("Settings saved.")
    setTimeout(() => setTestMessage(""), 2000)
  }

  const handleTest = async () => {
    if (!settings?.datasetId) {
      setTestMessage("Please set Dataset ID first.")
      setTestStatus("error")
      return
    }
    setTestStatus("loading")
    setTestMessage("")
    try {
      const res = await fetch("/api/brightdata/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetId: settings.datasetId,
          includeErrors: settings.includeErrors,
          customOutputFields: settings.customOutputFields || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setTestStatus("success")
        setTestMessage(data.message ?? "Credentials valid.")
      } else {
        setTestStatus("error")
        setTestMessage(data.error ?? "Test failed.")
      }
    } catch (err) {
      setTestStatus("error")
      setTestMessage(err instanceof Error ? err.message : "Network error")
    }
  }

  if (!settings) return null

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Configure Bright Data Crawl API. API key is stored server-side (env). Configure dataset and output options below.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="datasetId">Dataset ID</Label>
        <Input
          id="datasetId"
          placeholder="e.g. gd_m6gjtfmeh43we6cqc"
          value={settings.datasetId}
          onChange={(e) => setSettings({ ...settings, datasetId: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="outputFields">Default Output Fields (pipe-separated)</Label>
        <Input
          id="outputFields"
          placeholder="markdown|html|ld_json|page_html"
          value={settings.customOutputFields}
          onChange={(e) => setSettings({ ...settings, customOutputFields: e.target.value })}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="includeErrors"
          checked={settings.includeErrors}
          onCheckedChange={(v) => setSettings({ ...settings, includeErrors: !!v })}
        />
        <Label htmlFor="includeErrors">Include errors in results</Label>
      </div>

      <div className="space-y-2">
        <Label>Download Format</Label>
        <Select
          value={settings.downloadFormat}
          onValueChange={(v: BrightDataSettings["downloadFormat"]) =>
            setSettings({ ...settings, downloadFormat: v })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="ndjson">NDJSON</SelectItem>
            <SelectItem value="jsonl">JSONL</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <Button onClick={handleSave}>Save</Button>
        <Button variant="outline" onClick={handleTest} disabled={testStatus === "loading"}>
          {testStatus === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Test
        </Button>
        <Button variant="outline" asChild>
          <a href="/crawl" target="_blank" rel="noopener noreferrer">
            View Recent Snapshots
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </Button>
      </div>

      {(testMessage || testStatus !== "idle") && (
        <p
          className={`text-sm ${
            testStatus === "success"
              ? "text-green-600"
              : testStatus === "error"
              ? "text-destructive"
              : "text-muted-foreground"
          }`}
        >
          {testMessage}
        </p>
      )}
    </div>
  )
}
