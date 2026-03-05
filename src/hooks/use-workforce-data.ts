"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchWorkforceData } from "@/services"

export function useWorkforceData() {
  return useQuery({
    queryKey: ["workforce-data"],
    queryFn: fetchWorkforceData,
    staleTime: 60 * 60 * 1000,
  })
}
