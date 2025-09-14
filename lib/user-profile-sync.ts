// Global user profile sync utility similar to candidate-status-sync
// Provides optimistic cross-tab + in-app propagation of updated user name / image
// without waiting for next-auth session refresh. Session will eventually refresh on navigation.

export interface UserProfileBroadcast {
  name?: string | null
  image?: string | null
  updatedAt: number
}

const STORAGE_KEY = 'user-profile-cache'
const EVENT_NAME = 'user-profile:changed'

let cached: UserProfileBroadcast | null = null

function loadFromStorage(): UserProfileBroadcast | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as UserProfileBroadcast
    if (!data || typeof data !== 'object') return null
    cached = data
    return data
  } catch { return null }
}

export function getCachedUserProfile(): UserProfileBroadcast | null {
  if (cached) return cached
  return loadFromStorage()
}

export type UserProfileListener = (p: UserProfileBroadcast) => void
const listeners = new Set<UserProfileListener>()

export function subscribeUserProfile(listener: UserProfileListener) {
  listeners.add(listener)
  const current = getCachedUserProfile()
  if (current) listener(current)
  return () => { listeners.delete(listener) }
}

function emit(profile: UserProfileBroadcast) {
  listeners.forEach(l => { try { l(profile) } catch { /* ignore */ } })
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: profile }))
  }
}

export function broadcastUserProfile(partial: { name?: string | null; image?: string | null }) {
  const next: UserProfileBroadcast = {
    name: partial.name ?? cached?.name ?? null,
    image: partial.image ?? cached?.image ?? null,
    updatedAt: Date.now()
  }
  cached = next
  try { if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  emit(next)
}

// Cross-tab listener
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const data = JSON.parse(e.newValue) as UserProfileBroadcast
        cached = data
        emit(data)
      } catch { /* ignore */ }
    }
  })
  window.addEventListener(EVENT_NAME, (e: any) => {
    const detail: UserProfileBroadcast | undefined = e?.detail
    if (detail) {
      cached = detail
      listeners.forEach(l => { try { l(detail) } catch {} })
    }
  })
}