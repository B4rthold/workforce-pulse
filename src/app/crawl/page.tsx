"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CrawlRunner } from "@/components/brightdata/CrawlRunner"
import { SnapshotsList } from "@/components/brightdata/SnapshotsList"
import { DiagnosticsPanel } from "@/components/brightdata/DiagnosticsPanel"

export default function CrawlPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Bright Data Crawl
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Trigger and monitor Crawl API jobs. Configure in Settings.
        </p>
      </div>

      <Tabs defaultValue="runner" className="w-full">
        <TabsList>
          <TabsTrigger value="runner">Crawl Runner</TabsTrigger>
          <TabsTrigger value="snapshots">Recent Snapshots</TabsTrigger>
        </TabsList>
        <TabsContent value="runner" className="mt-4">
          <CrawlRunner />
        </TabsContent>
        <TabsContent value="snapshots" className="mt-4">
          <SnapshotsList />
        </TabsContent>
      </Tabs>

      <DiagnosticsPanel />
    </div>
  )
}
