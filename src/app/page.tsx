"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, BookOpen, CheckCircle2, Zap, ChevronRight, Building2, RefreshCw } from "lucide-react"
import { fetchPulseSummary, fetchAlerts, fetchSectors, runAggregate } from "@/services"
import { SectorStripCard } from "@/components/sectors/sector-strip-card"
import { useWorkforceData } from "@/hooks/use-workforce-data"
import { useJobInsights } from "@/hooks/use-job-insights"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const ALERT_STYLES: Record<string, string> = {
  critical: "border-l-4 border-l-red-500 bg-red-50",
  watch: "border-l-4 border-l-amber-500 bg-amber-50",
  stable: "border-l-4 border-l-green-500 bg-green-50",
}

const STATUS_COLOR_CLASS: Record<string, string> = {
  critical: "text-pulse-critical",
  watch: "text-pulse-watch",
  stable: "text-pulse-stable",
}

const STATUS_BADGE_CLASS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-300",
  watch: "bg-amber-100 text-amber-800 border-amber-300",
  stable: "bg-green-100 text-green-800 border-green-300",
}

export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["pulseSummary"],
    queryFn: fetchPulseSummary,
  })

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
  })

  const { data: sectors } = useQuery({
    queryKey: ["sectors"],
    queryFn: fetchSectors,
  })

  const { data: workforceData } = useWorkforceData()
  const { data: jobInsights } = useJobInsights()
  const queryClient = useQueryClient()
  const aggregateMutation = useMutation({
    mutationFn: () => runAggregate(false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-insights"] })
    },
  })

  const criticalRolesCount = useMemo(() => {
    if (jobInsights?.insights?.criticalRolesCount != null) return jobInsights.insights.criticalRolesCount
    const ps = workforceData?.sectorStats?.find((s) => s.sectorId === "public-safety")
    if (ps?.cityOpenJobs != null) return ps.cityOpenJobs
    return summary?.criticalRolesCount ?? 0
  }, [jobInsights?.insights?.criticalRolesCount, workforceData?.sectorStats, summary?.criticalRolesCount])

  const fastestRisingSkills = useMemo(() => {
    if (jobInsights?.insights?.topSkills?.length) {
      return jobInsights.insights.topSkills.slice(0, 8).map((s) => s.name)
    }
    return summary?.fastestRisingSkills ?? []
  }, [jobInsights?.insights?.topSkills, summary?.fastestRisingSkills])

  const sectorsOrdered = useMemo(() => {
    if (!sectors) return []
    const publicSafety = sectors.find((s) => s.id === "public-safety")
    const rest = sectors.filter((s) => s.id !== "public-safety")
    return publicSafety ? [publicSafety, ...rest] : sectors
  }, [sectors])

  const now = new Date()
  const hour = now.getHours()
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <div className="space-y-8">
      {/* Hero greeting */}
      <div className="opacity-0 animate-fade-in-up">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {greeting}
        </h1>
        <p className="text-muted-foreground mt-2 text-base">
          Here is what is happening across your workforce today.
        </p>
      </div>

      {/* Alert banners */}
      <div className="space-y-2 opacity-0 animate-fade-in-up animate-stagger-1" style={{ animationFillMode: "forwards" }}>
        {alertsLoading
          ? [...Array(2)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-md" />)
          : alerts?.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-md px-4 py-3",
                  ALERT_STYLES[alert.severity]
                )}
              >
                <p className="text-sm flex-1">{alert.message}</p>
                {alert.cta && (
                  <Button variant="ghost" size="sm" className="shrink-0 gap-1 text-xs" asChild>
                    <Link href={alert.cta.href}>
                      {alert.cta.label}
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </Button>
                )}
              </div>
            ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Critical Roles — Public Safety emphasis */}
        <Card className="tile-critical card-shadow opacity-0 animate-fade-in-up animate-stagger-2 transition-shadow hover:shadow-lg" style={{ animationFillMode: "forwards" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-pulse-critical" />
              Critical Roles
              <span className="ml-1 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700">
                Public Safety
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(summaryLoading && !workforceData && !jobInsights) ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <span className="text-2xl font-bold text-pulse-critical">
                  {criticalRolesCount}
                </span>
                <p className="text-xs text-muted-foreground mt-1">Unfilled for 30+ days</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Training Needs */}
        <Card className="tile-watch card-shadow opacity-0 animate-fade-in-up animate-stagger-3 transition-shadow hover:shadow-lg" style={{ animationFillMode: "forwards" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Training Needs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <span className="text-2xl font-bold">{summary?.trainingNeedsCount}</span>
                <p className="text-xs text-muted-foreground mt-1">Identified gaps across sectors</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Overall Status */}
        <Card className="tile-accent card-shadow opacity-0 animate-fade-in-up animate-stagger-3 transition-shadow hover:shadow-lg" style={{ animationFillMode: "forwards" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-2xl font-bold capitalize",
                      STATUS_COLOR_CLASS[summary?.overallStatus ?? "stable"]
                    )}
                  >
                    {summary?.overallStatus}
                  </span>
                  <Badge
                    className={cn(
                      "text-xs border",
                      STATUS_BADGE_CLASS[summary?.overallStatus ?? "stable"]
                    )}
                  >
                    {summary?.overallStatus === "critical"
                      ? "Act now"
                      : summary?.overallStatus === "watch"
                      ? "Monitor"
                      : "On track"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">As of today</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Check-in streak */}
        <Card className="card-shadow opacity-0 animate-fade-in-up animate-stagger-4 transition-shadow hover:shadow-lg" style={{ animationFillMode: "forwards" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-pulse-stable" />
              Check-In Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <span className="text-2xl font-bold">{summary?.checkInStreak}</span>
                <span className="text-sm text-muted-foreground ml-1">days</span>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary?.checkInCompleted ? "Completed today" : "Use header button to check in"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sector strip — Impact Score + trend, Public Safety first */}
      <div className="space-y-3 opacity-0 animate-fade-in-up animate-stagger-4" style={{ animationFillMode: "forwards" }}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Sectors at a glance
          </h3>
          <Button variant="ghost" size="sm" className="text-xs" asChild>
            <Link href="/sectors">
              View all <ChevronRight className="h-3 w-3 ml-0.5" />
            </Link>
          </Button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {sectorsOrdered.map((sector) => (
            <SectorStripCard key={sector.id} sector={sector} />
          ))}
        </div>
      </div>

      {/* Fastest rising skills */}
      <Card className="card-shadow opacity-0 animate-fade-in-up animate-stagger-5 transition-shadow hover:shadow-md" style={{ animationFillMode: "forwards" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4 text-pulse-watch" />
            Fastest Rising Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summaryLoading ? (
            <div className="flex flex-wrap gap-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-24 rounded-full" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {fastestRisingSkills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick links + Refresh jobs */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/sectors">View all sectors <ChevronRight className="h-3 w-3 ml-1" /></Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/missions">Active missions <ChevronRight className="h-3 w-3 ml-1" /></Link>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="gap-1.5"
          onClick={() => aggregateMutation.mutate()}
          disabled={aggregateMutation.isPending}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", aggregateMutation.isPending && "animate-spin")} />
          {aggregateMutation.isPending ? "Updating…" : "Refresh job data"}
        </Button>
      </div>
    </div>
  )
}
