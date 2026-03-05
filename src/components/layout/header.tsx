"use client"

import { usePathname } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Bell, CheckCircle, Menu } from "lucide-react"
import { SettingsModal } from "@/components/settings/SettingsModal"
import { fetchAlerts, submitDailyCheckIn } from "@/services"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Dashboard"
  if (pathname.startsWith("/sectors/")) return "Sector Detail"
  if (pathname === "/sectors") return "Sectors"
  if (pathname === "/skills") return "Skills"
  if (pathname === "/missions") return "Missions"
  if (pathname === "/playbooks") return "Playbooks"
  if (pathname === "/crawl") return "Crawl"
  return "Workforce Pulse"
}

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const queryClient = useQueryClient()

  const { data: alerts } = useQuery({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
  })

  const criticalCount =
    alerts?.filter((a) => a.severity === "critical").length ?? 0

  const checkInMutation = useMutation({
    mutationFn: submitDailyCheckIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pulseSummary"] })
    },
  })

  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-background px-4 shrink-0">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Separator orientation="vertical" className="lg:hidden h-5" />

      <h1 className="flex-1 text-sm font-semibold">
        {getPageTitle(pathname)}
      </h1>

      <Button
        variant="ghost"
        size="icon"
        className="relative"
        aria-label="Alerts"
      >
        <Bell className="h-5 w-5" />
        {criticalCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-4 min-w-4 px-1 py-0 text-[10px] leading-none flex items-center justify-center"
          >
            {criticalCount}
          </Badge>
        )}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => checkInMutation.mutate()}
        disabled={checkInMutation.isPending}
        className="gap-2"
      >
        <CheckCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Daily Check-In</span>
      </Button>

      <SettingsModal />
    </header>
  )
}
