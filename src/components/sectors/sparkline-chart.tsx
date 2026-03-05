"use client"

import { LineChart, Line, ResponsiveContainer } from "recharts"
import type { PulseStatus } from "@/services/types"

interface SparklineChartProps {
  data: number[]
  status: PulseStatus
  height?: number
}

const STATUS_COLOR: Record<PulseStatus, string> = {
  critical: "#ef4444",
  watch: "#f59e0b",
  stable: "#22c55e",
}

export function SparklineChart({ data, status, height = 40 }: SparklineChartProps) {
  const chartData = data.map((value, index) => ({ index, value }))
  const color = STATUS_COLOR[status]

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
