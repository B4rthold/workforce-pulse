"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface HiringTrendChartProps {
  data: { month: string; hires: number; attrition: number }[]
}

export function HiringTrendChart({ data }: HiringTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -8 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11 }}
          tickFormatter={(v: string) => v.slice(0, 3)}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 6,
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--background))",
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="hires" name="Hires" fill="#22c55e" radius={[3, 3, 0, 0]} />
        <Bar dataKey="attrition" name="Attrition" fill="#ef4444" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
