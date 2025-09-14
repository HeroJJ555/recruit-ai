import { Sidebar } from "@/components/recruiter/sidebar"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { Suspense } from "react"
import { Badge } from "@/components/ui/badge"

type Metrics = {
  jobsTotal: number
  jobsOpen: number
  applicationsTotal: number
  applicationsLast7d: number
  avgAppsPerOpenJob: number
  openRate: number
  trend: { days: { date: string; count: number }[] }
  topJobs: { id: string; title: string; applications: number; status: string }[]
  statusCounts: { status: string; count: number }[]
  warnings: string[]
}

async function getMetrics(): Promise<Metrics> {
  const warnings: string[] = []
  const base: Metrics = {
    jobsTotal: 0,
    jobsOpen: 0,
    applicationsTotal: 0,
    applicationsLast7d: 0,
    avgAppsPerOpenJob: 0,
    openRate: 0,
    trend: { days: [] },
    topJobs: [],
    statusCounts: [],
    warnings
  }
  const now = new Date()
  const from7 = new Date(now.getTime() - 7*24*60*60*1000)

  // Guard if prisma client not ready
  if (!(prisma as any)?.job) {
    warnings.push('Model Job nie jest dostępny (brak migracji?)')
    return base
  }
  if (!(prisma as any)?.candidateApplication) {
    warnings.push('Model CandidateApplication nie jest dostępny (brak migracji?)')
  }

  try {
    const [jobs, jobsOpen, appsTotal, appsLast7] = await Promise.all([
      (prisma as any).job.findMany({ select: { id: true, status: true } }).catch((e: any)=>{warnings.push('Pobranie jobs: '+(e.code||e.message)); return []}),
      (prisma as any).job.count({ where: { status: 'OPEN' } }).catch((e: any)=>{warnings.push('Zliczenie otwartych: '+(e.code||e.message)); return 0}),
      (prisma as any).candidateApplication?.count().catch((e: any)=>{warnings.push('Zliczenie aplikacji: '+(e.code||e.message)); return 0}) ?? 0,
      (prisma as any).candidateApplication?.count({ where: { createdAt: { gte: from7 } } }).catch((e: any)=>{warnings.push('Aplikacje 7d: '+(e.code||e.message)); return 0}) ?? 0,
    ])
    base.jobsTotal = jobs.length
    base.jobsOpen = jobsOpen
    base.applicationsTotal = appsTotal
    base.applicationsLast7d = appsLast7
    if (base.jobsOpen > 0) base.avgAppsPerOpenJob = +(base.applicationsTotal / base.jobsOpen).toFixed(2)
    if (base.jobsTotal > 0) base.openRate = +(base.jobsOpen / base.jobsTotal * 100).toFixed(1)

    // Status counts
    const statuses = ['DRAFT','OPEN','PAUSED','CLOSED']
    base.statusCounts = await Promise.all(statuses.map(async s => ({ status: s, count: await (prisma as any).job.count({ where: { status: s } }).catch(()=>0) })))

    // Top jobs by applications
    if ((prisma as any).candidateApplication) {
      const appsGrouped = await (prisma as any).candidateApplication.groupBy?.({
        by: ['jobId'], _count: { jobId: true }, where: { jobId: { not: null } }
      }).catch(()=>[])
      const countsMap: Record<string, number> = {}
      for (const row of appsGrouped) if (row.jobId) countsMap[row.jobId] = row._count.jobId
      const topIds = Object.entries(countsMap).sort((a,b)=>b[1]-a[1]).slice(0,5).map(e=>e[0])
      if (topIds.length) {
        const topJobs = await (prisma as any).job.findMany({ where: { id: { in: topIds } }, select: { id:true, title:true, status:true } }).catch(()=>[])
        base.topJobs = topJobs.map((j: any) => ({ id: j.id, title: j.title, status: j.status, applications: countsMap[j.id] || 0 }))
        base.topJobs.sort((a,b)=>b.applications - a.applications)
      }
    }

    // Trend daily
    if ((prisma as any).candidateApplication) {
      const days: { date: string; count: number }[] = []
      for (let i=6;i>=0;i--) {
        const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()-i)
        const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate()-i+1)
        const c = await (prisma as any).candidateApplication.count({ where: { createdAt: { gte: dayStart, lt: dayEnd } } }).catch(()=>0)
        days.push({ date: dayStart.toISOString().slice(0,10), count: c })
      }
      base.trend.days = days
    }
  } catch (e: any) {
    warnings.push('Ogólny błąd pobierania: ' + (e.code || e.message))
  }
  return base
}

function TrendMiniChart({ days }: { days: { date: string; count: number }[] }) {
  if (!days?.length) return <div className="text-xs text-muted-foreground">Brak danych trendu</div>
  
  const max = Math.max(...days.map(d => d.count), 1)
  const today = new Date().toISOString().slice(0,10)
  
  // Oblicz zmiany procentowe dzień do dnia
  const daysWithChanges = days.map((day, i) => {
    const previousDay = i > 0 ? days[i - 1] : null
    let change = 0
    let changePercent = 0
    
    if (previousDay && previousDay.count > 0) {
      change = day.count - previousDay.count
      changePercent = ((day.count - previousDay.count) / previousDay.count) * 100
    }
    
    return {
      ...day,
      change,
      changePercent,
      isIncrease: change > 0,
      isDecrease: change < 0
    }
  })
  
  // Formatuj daty dla lepszej czytelności
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const dayNames = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb']
    return {
      short: `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`,
      dayName: dayNames[date.getDay()]
    }
  }
  
  return (
    <div className="grid grid-rows-[1fr_auto_auto] gap-4">
      <div className="flex items-end gap-3 h-48">
        {daysWithChanges.map((d, i) => {
          const heightPct = (d.count / max) * 100
          const isToday = d.date === today
          const formatted = formatDate(d.date)
          
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-2 relative group">
              {/* Wskaźnik zmiany nad słupkiem */}
              {i > 0 && d.change !== 0 && (
                <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium flex items-center gap-1 ${
                  d.isIncrease ? 'text-green-600' : d.isDecrease ? 'text-red-600' : 'text-muted-foreground'
                }`}>
                  {d.isIncrease ? '↗' : d.isDecrease ? '↘' : '→'}
                  <span className="text-[10px]">
                    {d.changePercent > 0 ? '+' : ''}{Math.round(d.changePercent)}%
                  </span>
                </div>
              )}
              
              {/* Słupek */}
              <div
                className={`w-full rounded-t-md transition-all hover:opacity-80 ${
                  isToday ? 'bg-primary shadow-md' : 'bg-primary/60'
                }`}
                style={{ height: `calc(${heightPct}% - 4px)`, minHeight: '4px' }}
                aria-label={`${formatted.dayName} ${formatted.short}, aplikacje: ${d.count}${
                  i > 0 && d.change !== 0 ? `, zmiana: ${d.change > 0 ? '+' : ''}${d.change}` : ''
                }`}
              />
              
              {/* Liczba aplikacji */}
              <span className={`text-xs font-semibold tabular-nums ${
                isToday ? 'text-primary' : 'text-foreground'
              }`}>
                {d.count}
              </span>
            </div>
          )
        })}
      </div>
      
      {/* Etykiety dat z nazwami dni */}
      <div className="flex justify-between text-[10px] text-muted-foreground">
        {daysWithChanges.map(d => {
          const formatted = formatDate(d.date)
          const isToday = d.date === today
          return (
            <div key={d.date} className={`flex-1 text-center ${isToday ? 'text-primary font-medium' : ''}`}>
              <div className="font-medium">{formatted.dayName}</div>
              <div className="opacity-75">{formatted.short}</div>
            </div>
          )
        })}
      </div>
      
      {/* Legenda */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t pt-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-sm bg-primary" />
            <span>Dzisiaj</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-sm bg-primary/60" />
            <span>Poprzednie dni</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-green-600">↗ Wzrost</span>
          <span className="text-red-600">↘ Spadek</span>
        </div>
      </div>
    </div>
  )
}

// Funkcja pomocnicza do obliczania metryk trendu
function calculateTrendMetrics(days: { date: string; count: number }[]) {
  if (!days?.length) return null
  
  const total = days.reduce((sum, day) => sum + day.count, 0)
  const average = total / days.length
  
  const firstDay = days[0]?.count || 0
  const lastDay = days[days.length - 1]?.count || 0
  const totalChange = lastDay - firstDay
  const totalChangePercent = firstDay > 0 ? ((lastDay - firstDay) / firstDay) * 100 : 0
  
  // Trend kierunkowy (wzrostowy, spadkowy, stabilny)
  let trendDirection: 'up' | 'down' | 'stable' = 'stable'
  if (Math.abs(totalChangePercent) > 10) {
    trendDirection = totalChangePercent > 0 ? 'up' : 'down'
  }
  
  // Najlepszy i najgorszy dzień
  const maxDay = days.reduce((max, day) => day.count > max.count ? day : max, days[0])
  const minDay = days.reduce((min, day) => day.count < min.count ? day : min, days[0])
  
  return {
    total,
    average,
    totalChange,
    totalChangePercent,
    trendDirection,
    maxDay,
    minDay,
    isGrowing: totalChangePercent > 0,
    isDecreasing: totalChangePercent < 0
  }
}

function TrendSummaryCard({ days }: { days: { date: string; count: number }[] }) {
  const metrics = calculateTrendMetrics(days)
  
  if (!metrics) return <div className="text-xs text-muted-foreground">Brak danych do analizy</div>
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          Podsumowanie trendu
          <div className={`flex items-center gap-1 text-sm ${
            metrics.isGrowing ? 'text-green-600' : metrics.isDecreasing ? 'text-red-600' : 'text-muted-foreground'
          }`}>
            {metrics.trendDirection === 'up' && '📈'}
            {metrics.trendDirection === 'down' && '📉'}
            {metrics.trendDirection === 'stable' && '📊'}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Średnia dzienna</div>
            <div className="text-lg font-semibold">{metrics.average.toFixed(1)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Całkowita zmiana</div>
            <div className={`text-lg font-semibold flex items-center gap-1 ${
              metrics.isGrowing ? 'text-green-600' : metrics.isDecreasing ? 'text-red-600' : 'text-muted-foreground'
            }`}>
              {metrics.totalChange > 0 ? '+' : ''}{metrics.totalChange}
              <span className="text-sm">
                ({metrics.totalChangePercent > 0 ? '+' : ''}{metrics.totalChangePercent.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Najlepszy dzień</div>
            <div className="text-sm font-medium">
              {formatDate(metrics.maxDay.date)}
              <span className="text-muted-foreground ml-1">({metrics.maxDay.count})</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Najsłabszy dzień</div>
            <div className="text-sm font-medium">
              {formatDate(metrics.minDay.date)}
              <span className="text-muted-foreground ml-1">({metrics.minDay.count})</span>
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground mb-1">Analiza trendu</div>
          <div className="text-sm">
            {metrics.trendDirection === 'up' && 
              `📈 Trend wzrostowy - aplikacje wzrosły o ${metrics.totalChangePercent.toFixed(1)}% w ostatnim tygodniu`}
            {metrics.trendDirection === 'down' && 
              `📉 Trend spadkowy - aplikacje spadły o ${Math.abs(metrics.totalChangePercent).toFixed(1)}% w ostatnim tygodniu`}
            {metrics.trendDirection === 'stable' && 
              `📊 Trend stabilny - niewielkie wahania w liczbie aplikacji`}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

async function MetricsSection() {
  const data = await getMetrics()
  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Wszystkie oferty" value={data.jobsTotal} footer="Łączna liczba utworzonych ofert" />
        <StatCard title="Otwarte oferty" value={data.jobsOpen} footer={`Współczynnik otwarcia: ${data.openRate}%`} />
        <StatCard title="Aplikacje" value={data.applicationsTotal} footer={`Ostatnie 7 dni: ${data.applicationsLast7d}`} />
        <StatCard title="Śr. aplikacji / otwartą" value={data.avgAppsPerOpenJob} footer="Aktywność kandydatów" />
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">Trend aplikacji (7 dni)
              <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" aria-hidden />
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Podgląd dziennej liczby nowych aplikacji z analizą zmian.</p>
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">Aktualizacja: teraz</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TrendMiniChart days={data.trend.days} />
            </div>
            <div className="lg:col-span-1">
              <TrendSummaryCard days={data.trend.days} />
            </div>
          </div>
          {data.warnings?.length ? (
            <div className="text-xs text-amber-600 space-y-1 border-t pt-4">
              {data.warnings.map((w: string, i: number) => <p key={i}>⚠ {w}</p>)}
            </div>
          ) : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Status ofert</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {data.statusCounts.map(sc => (
              <div key={sc.status} className="flex items-center gap-2 border rounded-md px-3 py-2 text-sm">
                <Badge variant={sc.status === 'OPEN' ? 'default' : sc.status === 'DRAFT' ? 'secondary' : sc.status === 'CLOSED' ? 'destructive' : 'outline'}>{sc.status}</Badge>
                <span className="font-medium">{sc.count}</span>
              </div>
            ))}
            {!data.statusCounts.length && <p className="text-xs text-muted-foreground">Brak danych statusów.</p>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Top 5 ofert wg aplikacji</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topJobs.length ? data.topJobs.map(j => (
              <div key={j.id} className="flex items-center justify-between border rounded-md px-3 py-2 text-sm">
                <div className="flex flex-col">
                  <span className="font-medium line-clamp-1">{j.title}</span>
                  <span className="text-xs text-muted-foreground">{j.status}</span>
                </div>
                <div className="text-sm font-semibold">{j.applications}</div>
              </div>
            )) : <p className="text-xs text-muted-foreground">Brak aplikacji.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ title, value, footer }: { title: string; value: number | string; footer: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold leading-tight">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{footer}</div>
      </CardContent>
    </Card>
  )
}

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/signin")
  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 flex-shrink-0" />
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-2xl leading-tight">Statystyki</h1>
            <p className="text-muted-foreground text-sm">Kluczowe wskaźniki wydajności procesów rekrutacyjnych.</p>
          </div>
          <div className="flex items-center gap-3" />
        </header>
        <Suspense fallback={<div className="text-sm text-muted-foreground">Ładowanie metryk...</div>}>
          <MetricsSection />
        </Suspense>
      </main>
    </div>
  )
}
