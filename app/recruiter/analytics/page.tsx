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
  const w = 160
  const h = 50
  const step = w / (days.length - 1 || 1)
  const points = days.map((d, i) => `${i * step},${h - (d.count / max) * (h - 4) - 2}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-14">
      <polyline fill="none" stroke="hsl(var(--primary))" strokeWidth={2} points={points} strokeLinecap="round" strokeLinejoin="round" />
      {days.map((d, i) => (
        <circle key={d.date} cx={i * step} cy={h - (d.count / max) * (h - 4) - 2} r={2} fill="hsl(var(--primary))" />
      ))}
    </svg>
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Trend aplikacji (7 dni)</CardTitle>
          </div>
          <div className="text-xs text-muted-foreground">Ostatnia aktualizacja: teraz</div>
        </CardHeader>
        <CardContent>
            <TrendMiniChart days={data.trend.days} />
            <div className="flex gap-2 mt-4 flex-wrap text-xs text-muted-foreground">
              {data.trend.days.map((d: { date: string; count: number }) => (
                <div key={d.date} className="flex flex-col items-center w-10">
                  <span className="font-medium">{d.count}</span>
                  <span>{d.date.slice(5)}</span>
                </div>
              ))}
            </div>
            {data.warnings?.length ? (
              <div className="mt-4 text-xs text-amber-600 space-y-1">
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
            <h1 className="font-heading font-bold text-2xl leading-tight">Analityka</h1>
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
