"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PulseRing } from "./pulse-ring"
import { SparklineChart } from "./sparkline-chart"
import { cn } from "@/lib/utils"
import type { Sector } from "@/services/types"

const BADGE_CLASS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-300",
  watch: "bg-amber-100 text-amber-800 border-amber-300",
  stable: "bg-green-100 text-green-800 border-green-300",
}

interface SectorStripCardProps {
  sector: Sector
}

export function SectorStripCard({ sector }: SectorStripCardProps) {
  const isPublicSafety = sector.id === "public-safety"

  return (
    <Link href={`/sectors/${sector.id}`} className="block shrink-0 min-w-[140px] max-w-[180px]">
      <Card
        className={cn(
          "h-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group",
          isPublicSafety && "ring-1 ring-red-200/60"
        )}
      >
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-sm truncate group-hover:text-primary transition-colors">
              {sector.name}
            </span>
            <PulseRing score={sector.pulseScore} status={sector.status} size={40} strokeWidth={4} />
          </div>
          <div className="flex items-center gap-1.5">
            <Badge className={cn("text-[10px] border px-1.5 py-0", BADGE_CLASS[sector.status])}>
              {sector.status}
            </Badge>
            {isPublicSafety && (
              <span className="text-[9px] font-semibold uppercase text-red-600">Critical</span>
            )}
          </div>
          <SparklineChart data={sector.sparklineData} status={sector.status} height={28} />
        </CardContent>
      </Card>
    </Link>
  )
}
