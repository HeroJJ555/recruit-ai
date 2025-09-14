"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, TrendingUp, Clock } from "lucide-react"
import { useEffect, useState } from "react"

interface StatsData {
  totalCandidates: number
  candidatesThisMonth: number
  openJobs: number
  averageMatchScore: number
  analyzedCandidates: number
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

  const dashboardData = [
    {
      title: "Kandydaci ogółem",
      value: stats.totalCandidates.toString(),
      change: `+${stats.candidatesThisMonth}`,
      changeType: "positive" as const,
      icon: Users,
      description: "w tym miesiącu",
    },
    {
      title: "Przeanalizowane CV",
      value: stats.analyzedCandidates.toString(),
      change: `${Math.round((stats.analyzedCandidates / Math.max(stats.totalCandidates, 1)) * 100)}%`,
      changeType: "neutral" as const,
      icon: FileText,
      description: "pokrycie AI",
    },
    {
      title: "Średnie dopasowanie",
      value: stats.averageMatchScore > 0 ? `${Math.round(stats.averageMatchScore)}%` : "-",
      change: stats.averageMatchScore > 70 ? "Wysokie" : stats.averageMatchScore > 50 ? "Średnie" : "Niskie",
      changeType: stats.averageMatchScore > 70 ? "positive" : stats.averageMatchScore > 50 ? "neutral" : "negative" as const,
      icon: TrendingUp,
      description: "analiza AI",
    },
    {
      title: "Otwarte pozycje",
      value: stats.openJobs.toString(),
      change: "Aktywne",
      changeType: "positive" as const,
      icon: Clock,
      description: "rekrutacje",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {dashboardData.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className={`font-medium ${
                stat.changeType === "positive" 
                  ? "text-green-600" 
                  : stat.changeType === "negative" 
                    ? "text-red-600" 
                    : "text-blue-600"
              }`}>
                {stat.change}
              </span>
              <span>{stat.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
