"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, TrendingUp } from "lucide-react"
import { fetchSkills } from "@/services"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn, statusToColor } from "@/lib/utils"
import { SparklineChart } from "@/components/sectors/sparkline-chart"
import type { PulseStatus } from "@/services/types"

const CATEGORIES = [
  "All",
  "Cloud Infrastructure",
  "Data Science",
  "Healthcare",
  "Leadership",
  "Operations",
  "Safety Compliance",
  "Software Development",
]

const DEMAND_LEVELS: { value: PulseStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "watch", label: "Watch" },
  { value: "stable", label: "Stable" },
]

const BADGE_CLASS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-300",
  watch: "bg-amber-100 text-amber-800 border-amber-300",
  stable: "bg-green-100 text-green-800 border-green-300",
}

function SkillSkeleton() {
  return (
    <Card>
      <CardContent className="pt-4 pb-3 space-y-3">
        <div className="flex justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  )
}

export default function SkillsPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [demandLevel, setDemandLevel] = useState<PulseStatus | "all">("all")

  const { data: skills, isLoading } = useQuery({
    queryKey: ["skills"],
    queryFn: () => fetchSkills(),
  })

  const filtered = useMemo(() => {
    if (!skills) return []
    return skills.filter((s) => {
      if (category !== "All" && s.category !== category) return false
      if (demandLevel !== "all" && s.demandLevel !== demandLevel) return false
      if (search) {
        const q = search.toLowerCase()
        if (!s.name.toLowerCase().includes(q) && !s.category.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [skills, category, demandLevel, search])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Skills</h2>
        <p className="text-muted-foreground text-sm mt-1">
          In-demand skills across all workforce sectors.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 rounded-md border border-input p-1">
          {DEMAND_LEVELS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setDemandLevel(value)}
              className={cn(
                "rounded px-3 py-1 text-xs font-medium transition-colors",
                demandLevel === value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      {!isLoading && (
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {skills?.length ?? 0} skills
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? [...Array(9)].map((_, i) => <SkillSkeleton key={i} />)
          : filtered.map((skill) => (
              <Card key={skill.id}>
                <CardContent className="pt-4 pb-3 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm leading-tight">{skill.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{skill.category}</p>
                    </div>
                    <Badge
                      className={cn("text-xs border shrink-0 capitalize", BADGE_CLASS[skill.demandLevel])}
                    >
                      {skill.demandLevel}
                    </Badge>
                  </div>

                  <SparklineChart data={skill.sparklineData} status={skill.demandLevel} height={36} />

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      <span>Growth rate</span>
                    </div>
                    <span className={cn("font-semibold", statusToColor(skill.demandLevel))}>
                      +{skill.growthRate}%
                    </span>
                  </div>

                  {skill.relatedRoles.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {skill.relatedRoles.length} related role{skill.relatedRoles.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}

        {!isLoading && filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
            No skills match your filters.
          </div>
        )}
      </div>
    </div>
  )
}
