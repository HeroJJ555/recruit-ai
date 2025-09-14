// Simple in-process FIFO queue for CV analyses with concurrency=1
// Note: This is ephemeral and per-instance. For production use a durable queue (e.g., Supabase functions/cron, Redis, or a DB-backed job table).

type Job = () => Promise<void>

class AnalysisQueue {
  private queue: Job[] = []
  private running = false

  enqueue(job: Job) {
    this.queue.push(job)
    this.runNext()
  }

  size() {
    return this.queue.length + (this.running ? 1 : 0)
  }

  private async runNext() {
    if (this.running) return
    const next = this.queue.shift()
    if (!next) return
    this.running = true
    try {
      await next()
    } catch (e) {
      console.warn('Analysis job failed:', e)
    } finally {
      this.running = false
      // Defer next tick
      setTimeout(() => this.runNext(), 0)
    }
  }
}

// Singleton across module scope (within a single server process)
const globalAny = globalThis as any
export const analysisQueue: AnalysisQueue = globalAny.__analysisQueue || (globalAny.__analysisQueue = new AnalysisQueue())

// Helper to enqueue candidate analysis by id
export function enqueueCandidateAnalysis(appId: string) {
  const urlBase = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const internalKey = process.env.INTERNAL_ANALYSIS_KEY || ''
  analysisQueue.enqueue(async () => {
    const url = `${urlBase}/api/candidate/applications/${appId}/analyze`
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: internalKey ? { 'x-internal-analysis-key': internalKey } as any : undefined,
      })
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        console.warn('Analysis request failed', res.status, txt)
      }
    } catch (e) {
      console.warn('Analysis request error:', e)
    }
  })
}
