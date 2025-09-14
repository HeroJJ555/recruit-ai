"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, TrendingUp, Clock, Sparkles } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

interface StatsData {
  totalCandidates: number
  candidatesThisMonth: number
  openJobs: number
  averageMatchScore: number
  analyzedCandidates: number
}

type ChangeType = "positive" | "neutral" | "negative"
type Hue = "emerald" | "rose" | "sky"

const huePalette: Record<Hue, {
  text: string
  sparkles: string
  changeText: string
  glowFrame: string
  borderGrad: string
  cornerStrong: string
  cornerSoft: string
  gradientToText: string
  hex: string
}> = {
  emerald: {
    text: "text-emerald-500",
    sparkles: "text-emerald-500/70",
    changeText: "text-emerald-500",
    glowFrame: "from-emerald-400/60 via-emerald-500/40 to-emerald-700/30",
    borderGrad: "from-emerald-500/40 via-emerald-400/30 to-transparent",
    cornerStrong: "bg-emerald-500/20",
    cornerSoft: "bg-emerald-400/20",
    gradientToText: "to-emerald-500/70",
    hex: "#10B981",
  },
  rose: {
    text: "text-rose-500",
    sparkles: "text-rose-500/70",
    changeText: "text-rose-500",
    glowFrame: "from-rose-400/60 via-rose-500/40 to-rose-700/30",
    borderGrad: "from-rose-500/40 via-rose-400/30 to-transparent",
    cornerStrong: "bg-rose-500/20",
    cornerSoft: "bg-rose-400/20",
    gradientToText: "to-rose-500/70",
    hex: "#F43F5E",
  },
  sky: {
    text: "text-sky-500",
    sparkles: "text-sky-500/70",
    changeText: "text-sky-500",
    glowFrame: "from-sky-400/60 via-sky-500/40 to-sky-700/30",
    borderGrad: "from-sky-500/40 via-sky-400/30 to-transparent",
    cornerStrong: "bg-sky-500/20",
    cornerSoft: "bg-sky-400/20",
    gradientToText: "to-sky-500/70",
    hex: "#0EA5E9",
  },
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch('/api/stats/dashboard')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to load dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-20 animate-pulse" />
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 animate-pulse mb-2" />
              <div className="h-3 bg-muted rounded w-24 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const dashboardData: Array<{
    title: string
    value: string
    change: string
    changeType: ChangeType
    icon: React.ComponentType<{ className?: string }>
    description: string
  }> = [
    {
      title: "Kandydaci ogółem",
      value: stats.totalCandidates.toString(),
      change: `+${stats.candidatesThisMonth}`,
      changeType: "positive",
      icon: Users,
      description: "w tym miesiącu",
    },
    {
      title: "Przeanalizowane CV",
      value: stats.analyzedCandidates.toString(),
      change: `${Math.round((stats.analyzedCandidates / Math.max(stats.totalCandidates, 1)) * 100)}%`,
      changeType: "neutral",
      icon: FileText,
      description: "pokrycie AI",
    },
    {
      title: "Średnie dopasowanie",
      value: stats.averageMatchScore > 0 ? `${Math.round(stats.averageMatchScore)}%` : "-",
      change: stats.averageMatchScore > 70 ? "Wysokie" : stats.averageMatchScore > 50 ? "Średnie" : "Niskie",
      changeType: (stats.averageMatchScore > 70 ? "positive" : stats.averageMatchScore > 50 ? "neutral" : "negative"),
      icon: TrendingUp,
      description: "analiza AI",
    },
    {
      title: "Otwarte pozycje",
      value: stats.openJobs.toString(),
      change: "Aktywne",
      changeType: "positive",
      icon: Clock,
      description: "rekrutacje",
    },
  ]

  // Helpers
  const colorForType = (type: ChangeType): Hue =>
    type === "positive" ? "emerald" : type === "negative" ? "rose" : "sky"

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {dashboardData.map((stat, index) => {
        const hue = colorForType(stat.changeType)
        const palette = huePalette[hue]
        const numericValue = Number(String(stat.value).replace(/[^0-9.]/g, '')) || 0
        const isPercent = /%$/.test(stat.value)

        return (
          <div
            key={index}
            className="group relative"
          >
            {/* Glow frame */}
            <div className={`pointer-events-none absolute -inset-px rounded-xl opacity-60 blur transition duration-500 group-hover:opacity-100 group-hover:blur-md bg-gradient-to-br ${palette.glowFrame}`} />

            {/* Border gradient with glass card inside */}
            <div className={`relative rounded-xl p-px transition-all duration-500 ease-out group-hover:scale-[1.01] group-hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4)] bg-gradient-to-br ${palette.borderGrad}`}
            >
              <Card className="relative overflow-hidden rounded-[11px] backdrop-blur supports-backdrop-blur:bg-background/60">
                {/* Shimmer sweep */}
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute -left-1/3 top-0 h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-120%] group-hover:translate-x-[180%] transition-transform duration-[1400ms]" />
                </div>

                <CardHeader className="relative flex flex-col items-center justify-center space-y-1 pb-2 text-center">
                  <div className="flex items-center gap-2">
                    <stat.icon className={`h-5 w-5 ${palette.text}`} />
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <Sparkles className={`h-3 w-3 ${palette.sparkles} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
                  </div>
                </CardHeader>

                <CardContent className="relative">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="font-heading text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                      <CountUp value={numericValue} duration={900} suffix={isPercent ? "%" : undefined} />
                    </div>
                    <div className="mt-1 flex items-center space-x-2 text-xs">
                      <span className={`font-medium tabular-nums ${
                        stat.changeType === "positive"
                          ? huePalette.emerald.changeText
                          : stat.changeType === "negative"
                            ? huePalette.rose.changeText
                            : huePalette.sky.changeText
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-muted-foreground">{stat.description}</span>
                    </div>
                    {/* Sparkline removed for a cleaner dashboard */}
                  </div>

                  {/* Corner glow accents */}
                  <div className={`pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full ${palette.cornerStrong} blur-2xl`} />
                  <div className={`pointer-events-none absolute -left-6 -bottom-6 h-16 w-16 rounded-full ${palette.cornerSoft} blur-2xl`} />
                </CardContent>
              </Card>
            </div>

            {/* Click burst removed for a calmer UI */}
          </div>
        )
      })}
    </div>
  )
}

// ===== Local micro-components: CountUp, Sparkline, Burst =====

function CountUp({ value, duration = 1000, suffix }: { value: number; duration?: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const startRef = useRef<number | null>(null)
  const from = 0

  useEffect(() => {
    let raf = 0
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const step = (ts: number) => {
      if (startRef.current == null) startRef.current = ts
      const p = Math.min(1, (ts - startRef.current) / duration)
      const eased = easeOutCubic(p)
      setDisplay(from + (value - from) * eased)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  const formatted = useMemo(() => {
    if (value >= 1000 && !suffix) {
      return `${Math.round(display).toLocaleString()}`
    }
    if (suffix === "%") {
      return `${Math.round(display)}%`
    }
    return `${Math.round(display)}`
  }, [display, suffix, value])

  return <span className="tabular-nums">{formatted}</span>
}

// Sparkline and Burst removed