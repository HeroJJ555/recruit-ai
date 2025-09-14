import { useEffect, useState } from 'react'

// Central hook to read AI settings (currently only temperature).
// Reacts to:
//  - localStorage 'storage' events (multi-tab)
//  - custom window event 'ai-settings:changed' with detail { temperature }
export function useAiSettings() {
  const [temperature, setTemperature] = useState<number>(0.7)

  const clamp = (n: number) => Math.max(0, Math.min(1, n))

  const read = () => {
    try {
      if (typeof window === 'undefined') return
      const stored = window.localStorage.getItem('ai-temp')
      if (stored) {
        const num = parseFloat(stored)
        if (!isNaN(num)) {
          setTemperature(clamp(num))
          return
        }
      }
      setTemperature(0.7)
    } catch {/* noop */}
  }

  useEffect(() => {
    read()
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'ai-temp') read()
    }
    const onCustom = (e: Event) => {
      const detail: any = (e as CustomEvent).detail
      if (detail && typeof detail.temperature === 'number') {
        setTemperature(clamp(detail.temperature))
      } else {
        read()
      }
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('ai-settings:changed', onCustom as any)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('ai-settings:changed', onCustom as any)
    }
  }, [])

  return { temperature }
}
