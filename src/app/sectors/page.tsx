"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchSectors } from "@/services"
import { SectorCard } from "@/components/sectors/sector-card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, Eye, CheckCircle } from "lucide-react"

function SectorCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
      <Skeleton className="h-5 w-16" />
      <div className="grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-14" />
          </div>
        ))}
      </div>
      <Skeleton className="h-9 w-full" />
      <div className="flex justify-between pt-1 border-t">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

export default function SectorsPage() {
  const { data: sectors, isLoading, isError } = useQuery({
    queryKey: ["sectors"],
    queryFn: fetchSectors,
  })

  const criticalCount = sectors?.filter((s) => s.status === "critical").length ?? 0
  const watchCount = sectors?.filter((s) => s.status === "watch").length ?? 0
  const stableCount = sectors?.filter((s) => s.status === "stable").length ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Sectors</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor workforce health across all industry sectors.
        </p>
      </div>

      {/* Summary row */}
      {sectors && (
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-pulse-critical">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">{criticalCount} critical</span>
          </div>
          <div className="flex items-center gap-1.5 text-pulse-watch">
            <Eye className="h-4 w-4" />
            <span className="font-medium">{watchCount} watch</span>
          </div>
          <div className="flex items-center gap-1.5 text-pulse-stable">
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">{stableCount} stable</span>
          </div>
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">Failed to load sectors. Please try again.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {isLoading
          ? [...Array(8)].map((_, i) => <SectorCardSkeleton key={i} />)
          : sectors?.map((sector) => (
              <SectorCard key={sector.id} sector={sector} />
            ))}
      </div>
    </div>
  )
}
