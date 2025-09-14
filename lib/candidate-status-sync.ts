// Global candidate status sync utility
// Provides queueing, debounced flush, event-based auto flush (unload, visibility hidden)
// and a simple API: queueStatus(id, uiStatus) and subscribe(callback)

export type UiStatus = 'pending' | 'contacted' | 'interviewed' | 'hired' | 'rejected'

interface QueueRecord { [id: string]: UiStatus }

type Listener = (updates: QueueRecord) => void

const queue: QueueRecord = {}
const listeners = new Set<Listener>()
let debounce: number | null = null
let initialized = false

function mapUiToBackend(status: UiStatus): string {
  switch (status) {
    case 'pending': return 'PENDING'
    case 'contacted': return 'CONTACTED'
    case 'interviewed': return 'INTERVIEW_COMPLETED' // treat as last interview stage
    case 'hired': return 'HIRED'
    case 'rejected': return 'REJECTED'
    default: return 'PENDING'
  }
}

async function flushInternal() {
  const entries = Object.entries(queue)
  if (!entries.length) return
  const snapshot: QueueRecord = {}
  for (const [k,v] of entries) snapshot[k] = v
  // Clear queue early to avoid duplicate sends
  for (const k of Object.keys(queue)) delete queue[k]
  listeners.forEach(l => { try { l(snapshot) } catch {} })
  for (const [id, uiStatus] of entries) {
    const backend = mapUiToBackend(uiStatus)
    try {
      await fetch(`/api/recruiter/candidates/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: backend })
      })
    } catch (e) {
      // Re-queue on failure (lightweight retry strategy)
      queue[id] = uiStatus
    }
  }
  // Persist snapshot for resilience
  try { localStorage.setItem('candidate-status-cache', JSON.stringify({ ts: Date.now(), statuses: snapshot })) } catch {}
}

function scheduleFlush() {
  if (debounce) window.clearTimeout(debounce)
  debounce = window.setTimeout(flushInternal, 900)
}

function initEvents() {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  const exit = () => {
    const entries = Object.entries(queue)
    if (!entries.length) return
    for (const [id, uiStatus] of entries) {
      try {
        const backend = mapUiToBackend(uiStatus)
        const blob = new Blob([JSON.stringify({ status: backend })], { type: 'application/json' })
        navigator.sendBeacon(`/api/recruiter/candidates/${id}/status`, blob)
      } catch {}
    }
  }
  window.addEventListener('beforeunload', exit)
  window.addEventListener('pagehide', exit)
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') exit() })
}

export function queueCandidateStatus(id: string, status: UiStatus) {
  queue[id] = status
  scheduleFlush()
  initEvents()
}

export function flushCandidateStatuses() { return flushInternal() }

export function subscribeCandidateStatus(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function loadCachedStatuses(): QueueRecord {
  try {
    const raw = localStorage.getItem('candidate-status-cache')
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed.statuses || {}
  } catch { return {} }
}