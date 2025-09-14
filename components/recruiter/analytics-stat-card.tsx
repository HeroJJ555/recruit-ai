"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AnalyticsStatCard({ title, value, footer }: { title: string; value: number | string; footer: string }) {
  return (
    <Card className="group relative overflow-hidden">
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-sm font-medium flex items-center justify-center gap-2">
          {title}
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/70 group-hover:bg-primary transition" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center text-center gap-1">
        <div className="text-3xl font-semibold leading-tight tabular-nums">
          <CountUp value={value} />
        </div>
        <div className="text-xs text-muted-foreground">{footer}</div>
      </CardContent>
      <div className="pointer-events-none absolute -inset-x-10 -bottom-10 h-28 bg-gradient-to-t from-primary/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition" />
    </Card>
  )
}

function CountUp({ value }: { value: number | string }) {
  const numeric = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.]/g, ''))
  const isPercent = typeof value === 'string' && /%$/.test(value)
  const [disp, setDisp] = useState(0)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (Number.isNaN(numeric)) return
    let raf = 0
    const duration = 700
    const ease = (t: number) => 1 - Math.pow(1 - t, 3)
    const step = (ts: number) => {
      if (startRef.current == null) startRef.current = ts
      const p = Math.min(1, (ts - startRef.current) / duration)
      setDisp(numeric * ease(p))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [numeric])

  if (Number.isNaN(numeric)) return <span>{value}</span>
  const rounded = Math.round(disp)
  return <span>{isPercent ? `${rounded}%` : rounded.toLocaleString()}</span>
}
