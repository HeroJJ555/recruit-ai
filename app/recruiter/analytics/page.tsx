import { Sidebar } from "@/components/recruiter/sidebar"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Suspense } from "react"

async function fetchMetrics() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/recruiter/analytics/metrics`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Bad response')
    return await res.json()
  } catch (e) {
    return { jobsTotal: 0, jobsOpen: 0, applicationsTotal: 0, applicationsLast7d: 0, avgAppsPerOpenJob: 0, openRate: 0, trend: { days: [] }, warnings: ['Brak danych (offline lub brak migracji)'] }
  }
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
  const data = await fetchMetrics()
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
