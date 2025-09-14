"use client"

import { useMemo } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  XAxis,
  YAxis,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type Day = { date: string; count: number }

export function AnalyticsTrend({ days }: { days: Day[] }) {
  const data = useMemo(() => days?.map(d => ({ ...d, label: d.date.slice(5), value: d.count })) ?? [], [days])

  return (
    <ChartContainer
      className="h-[220px] w-full"
      config={{ value: { label: "Aplikacje", color: "hsl(var(--primary))" } }}
    >
      <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
        <defs>
          <linearGradient id="analyticsArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} interval={0} fontSize={11} />
        <YAxis width={28} tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#analyticsArea)" strokeWidth={2} isAnimationActive animationDuration={700} />
        <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} isAnimationActive animationDuration={700} />
      </AreaChart>
    </ChartContainer>
  )
}
