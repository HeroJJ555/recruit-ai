import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Returns aggregated recruiter analytics. Defensive against missing tables/columns.
export async function GET() {
  const session = await getServerSession(authOptions as any)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Basic shape with zero defaults
  const base = {
    jobsTotal: 0,
    jobsOpen: 0,
    applicationsTotal: 0,
    applicationsLast7d: 0,
    avgAppsPerOpenJob: 0,
    openRate: 0, // open / total
    trend: {
      // last 7 days applications per day
      days: [] as { date: string; count: number }[],
    },
    warnings: [] as string[]
  }

  // Helper safe query
  async function safe<T>(fn: () => Promise<T>, hint: string): Promise<T | null> {
    try { return await fn() } catch (e: any) { base.warnings.push(hint + ': ' + (e?.code || e?.message || 'error')); return null }
  }

  const now = new Date()
  const from7 = new Date(now.getTime() - 7*24*60*60*1000)

  // Parallel queries guarded
  const [jobs, openJobs, appsTotal, appsLast7] = await Promise.all<[
    any[] | null,
    number | null,
    number | null,
    number | null
  ]>([
    safe(() => (prisma as any)?.job?.findMany({ select: { id: true, status: true } }), 'Job table unavailable') as any,
    safe(() => (prisma as any)?.job?.count({ where: { status: 'OPEN' } }), 'Job count failed'),
    safe(() => (prisma as any)?.candidateApplication?.count(), 'CandidateApplication count failed'),
    safe(() => (prisma as any)?.candidateApplication?.count({ where: { createdAt: { gte: from7 } } }), 'CandidateApplication last7d failed')
  ])

  if (jobs && Array.isArray(jobs)) base.jobsTotal = jobs.length
  if (typeof openJobs === 'number') base.jobsOpen = openJobs
  if (typeof appsTotal === 'number') base.applicationsTotal = appsTotal
  if (typeof appsLast7 === 'number') base.applicationsLast7d = appsLast7

  if (base.jobsOpen > 0) base.avgAppsPerOpenJob = +(base.applicationsTotal / base.jobsOpen).toFixed(2)
  if (base.jobsTotal > 0) base.openRate = +(base.jobsOpen / base.jobsTotal * 100).toFixed(1)

  // Build daily trend (fallback to zero days if model missing)
  if ((prisma as any)?.candidateApplication) {
    const days: { date: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1)
      try {
        const count = await (prisma as any).candidateApplication.count({ where: { createdAt: { gte: dayStart, lt: dayEnd } } })
        days.push({ date: dayStart.toISOString().slice(0,10), count })
      } catch (e: any) {
        base.warnings.push('Trend day calc failed: ' + (e?.code || e?.message))
        days.push({ date: dayStart.toISOString().slice(0,10), count: 0 })
      }
    }
    base.trend.days = days
  }

  return NextResponse.json(base)
}