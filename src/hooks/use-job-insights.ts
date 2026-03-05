"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchJobInsights } from "@/services"

export function useJobInsights() {
  return useQuery({
    queryKey: ["job-insights"],
    queryFn: fetchJobInsights,
    staleTime: 60 * 1000,
  })
}
