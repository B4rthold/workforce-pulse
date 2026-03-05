import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PulseStatus } from "@/services/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDelta(delta: number): string {
  return delta >= 0 ? `+${delta}%` : `${delta}%`
}

export function statusToColor(status: PulseStatus): string {
  const map: Record<PulseStatus, string> = {
    critical: "text-pulse-critical",
    watch: "text-pulse-watch",
    stable: "text-pulse-stable",
  }
  return map[status]
}

export function statusToBgColor(status: PulseStatus): string {
  const map: Record<PulseStatus, string> = {
    critical: "bg-red-100 border-red-300",
    watch: "bg-amber-100 border-amber-300",
    stable: "bg-green-100 border-green-300",
  }
  return map[status]
}

export function statusToBorderLeft(status: PulseStatus): string {
  const map: Record<PulseStatus, string> = {
    critical: "border-l-red-500",
    watch: "border-l-amber-500",
    stable: "border-l-green-500",
  }
  return map[status]
}

export function statusToBorderTop(status: PulseStatus): string {
  const map: Record<PulseStatus, string> = {
    critical: "border-t-red-500",
    watch: "border-t-amber-500",
    stable: "border-t-green-500",
  }
  return map[status]
}

export function statusToHex(status: PulseStatus): string {
  const map: Record<PulseStatus, string> = {
    critical: "#ef4444",
    watch: "#f59e0b",
    stable: "#22c55e",
  }
  return map[status]
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}
