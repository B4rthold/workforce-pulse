"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronDown, ChevronUp, User, Calendar, ArrowRight } from "lucide-react"
import { fetchMissions, updateMissionStep } from "@/services"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Mission } from "@/services/types"

type StatusFilter = "all" | "active" | "completed" | "paused"

const STATUS_FILTER_LABELS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
]

const PRIORITY_BADGE: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-300",
  watch: "bg-amber-100 text-amber-800 border-amber-300",
  stable: "bg-green-100 text-green-800 border-green-300",
}

const STATUS_BADGE: Record<string, string> = {
  active: "bg-blue-100 text-blue-800 border-blue-300",
  completed: "bg-green-100 text-green-800 border-green-300",
  paused: "bg-gray-100 text-gray-700 border-gray-300",
}

function MissionCard({ mission }: { mission: Mission }) {
  const [expanded, setExpanded] = useState(false)
  const queryClient = useQueryClient()

  const stepMutation = useMutation({
    mutationFn: ({ stepId, completed }: { stepId: string; completed: boolean }) =>
      updateMissionStep(mission.id, stepId, completed),
    onSuccess: (updatedMission) => {
      queryClient.setQueryData<Mission[]>(["missions"], (old) =>
        old?.map((m) => (m.id === updatedMission.id ? updatedMission : m)) ?? []
      )
    },
  })

  const completedSteps = mission.steps.filter((s) => s.completed).length

  return (
    <Card className={cn(mission.status === "completed" && "opacity-75")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-snug">{mission.title}</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{mission.description}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <Badge className={cn("text-xs border capitalize", STATUS_BADGE[mission.status])}>
              {mission.status}
            </Badge>
            <Badge className={cn("text-xs border capitalize", PRIORITY_BADGE[mission.priority])}>
              {mission.priority}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1 mt-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{completedSteps}/{mission.steps.length} steps</span>
            <span>{mission.progress}%</span>
          </div>
          <Progress value={mission.progress} className="h-1.5" />
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
          {mission.assignee && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {mission.assignee}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Due {new Date(mission.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between text-xs text-muted-foreground h-7 px-1"
          onClick={() => setExpanded((v) => !v)}
        >
          <span>{expanded ? "Hide" : "Show"} steps &amp; impact</span>
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>

        {expanded && (
          <div className="mt-3 space-y-4">
            {/* Steps */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Steps</p>
              {mission.steps.map((step) => (
                <div key={step.id} className="flex items-start gap-2.5">
                  <Checkbox
                    id={step.id}
                    checked={step.completed}
                    disabled={stepMutation.isPending || mission.status === "completed"}
                    onCheckedChange={(checked) =>
                      stepMutation.mutate({ stepId: step.id, completed: !!checked })
                    }
                    className="mt-0.5 shrink-0"
                  />
                  <label
                    htmlFor={step.id}
                    className={cn(
                      "text-xs leading-relaxed cursor-pointer",
                      step.completed ? "line-through text-muted-foreground" : ""
                    )}
                  >
                    <span className="font-medium">{step.title}</span>
                    <br />
                    <span className="text-muted-foreground">{step.description}</span>
                  </label>
                </div>
              ))}
            </div>

            {/* Impact metrics */}
            {mission.impactMetrics.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Impact Targets
                </p>
                <div className="space-y-1.5">
                  {mission.impactMetrics.map((metric) => (
                    <div key={metric.label} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{metric.label}</span>
                      <div className="flex items-center gap-1.5 font-medium">
                        <span className="text-muted-foreground">{metric.before}{metric.unit}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-pulse-stable">{metric.after}{metric.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MissionSkeleton() {
  return (
    <Card>
      <CardContent className="pt-4 pb-3 space-y-3">
        <div className="flex justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
        <Skeleton className="h-2 w-full" />
      </CardContent>
    </Card>
  )
}

export default function MissionsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  const { data: missions, isLoading } = useQuery({
    queryKey: ["missions"],
    queryFn: fetchMissions,
  })

  const filtered = missions?.filter(
    (m) => statusFilter === "all" || m.status === statusFilter
  ) ?? []

  const counts = {
    all: missions?.length ?? 0,
    active: missions?.filter((m) => m.status === "active").length ?? 0,
    paused: missions?.filter((m) => m.status === "paused").length ?? 0,
    completed: missions?.filter((m) => m.status === "completed").length ?? 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Missions</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Strategic workforce initiatives — track steps and measure impact.
        </p>
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-1 rounded-md border border-input p-1 w-fit">
        {STATUS_FILTER_LABELS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={cn(
              "rounded px-3 py-1 text-xs font-medium transition-colors",
              statusFilter === value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {label}
            <span className="ml-1.5 opacity-60">({counts[value]})</span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading
          ? [...Array(4)].map((_, i) => <MissionSkeleton key={i} />)
          : filtered.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}

        {!isLoading && filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No missions with status &ldquo;{statusFilter}&rdquo;.
          </p>
        )}
      </div>
    </div>
  )
}
