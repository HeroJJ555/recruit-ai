"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UserLite { name?: string | null; email?: string | null; image?: string | null }

function ThemeSettings({ value, onChange }: { value: string; onChange: (t: string) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Motyw kolorystyczny</CardTitle>
        <CardDescription>Dostosuj wygląd aplikacji przed zapisaniem.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant={value === "light" ? "default" : "outline"}
            size="sm"
            onClick={() => onChange("light")}
            className="flex items-center gap-2 h-12"
          >
            <Sun className="h-4 w-4" />
            <div className="text-left">
              <div className="text-sm">Jasny</div>
              <div className="text-xs text-muted-foreground">Zawsze jasny</div>
            </div>
          </Button>
          <Button
            variant={value === "dark" ? "default" : "outline"}
            size="sm"
            onClick={() => onChange("dark")}
            className="flex items-center gap-2 h-12"
          >
            <Moon className="h-4 w-4" />
            <div className="text-left">
              <div className="text-sm">Ciemny</div>
              <div className="text-xs text-muted-foreground">Zawsze ciemny</div>
            </div>
          </Button>
          <Button
            variant={value === "system" ? "default" : "outline"}
            size="sm"
            onClick={() => onChange("system")}
            className="flex items-center gap-2 h-12"
          >
            <Monitor className="h-4 w-4" />
            <div className="text-left">
              <div className="text-sm">System</div>
              <div className="text-xs text-muted-foreground">Auto</div>
            </div>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Zmiana zostanie zastosowana po kliknięciu „Zapisz zmiany”.</p>
      </CardContent>
    </Card>
  )
}

function AISettings({ value, onChange }: { value: number; onChange: (v:number)=>void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Asystent AI</CardTitle>
        <CardDescription>Dostosuj kreatywność (nie zapisuje się automatycznie).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Temperatura: {value.toFixed(2)}</label>
          <input type="range" min={0} max={1} step={0.05} value={value} onChange={e => onChange(parseFloat(e.target.value))} className="w-full" />
          <p className="text-xs text-muted-foreground">0 = deterministycznie, 1 = bardziej swobodnie. Zapis po kliknięciu „Zapisz zmiany”.</p>
        </div>
      </CardContent>
    </Card>
  )
}

function NotificationsSettings() {
  const items = [
    { key: 'emailNewCandidates', label: 'Email o nowych kandydatach' },
    { key: 'weeklySummary', label: 'Tygodniowe podsumowanie' },
    { key: 'slaAlerts', label: 'Alerty SLA (opóźnione procesy)' },
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle>Powiadomienia</CardTitle>
        <CardDescription>Na razie ustawienia nie są zapisywane – warstwa demonstracyjna.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map(i => (
          <div key={i.key} className="flex items-center justify-between py-1">
            <span className="text-sm">{i.label}</span>
            <Switch disabled />
          </div>
        ))}
        <p className="text-xs text-muted-foreground">Persistence pojawi się po dodaniu tabeli ustawień użytkownika.</p>
      </CardContent>
    </Card>
  )
}

function ProfileForm({ name, image, onChange }: { name: string; image: string; onChange: (field: 'name' | 'image', value: string) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil</CardTitle>
        <CardDescription>Podstawowe informacje identyfikujące rekrutera. Zapis nastąpi przy kliknięciu „Zapisz zmiany”.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Imię / nazwa</label>
            <Input value={name} onChange={e => onChange('name', e.target.value)} minLength={2} maxLength={80} required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">URL zdjęcia (opcjonalne)</label>
            <Input value={image} onChange={e => onChange('image', e.target.value)} placeholder="https://..." />
          </div>
          <p className="text-xs text-muted-foreground">Zmiany w profilu nie są zapisywane automatycznie.</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ClientSettingsTabs({ user }: { user: UserLite }) {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [pendingTheme, setPendingTheme] = useState<string>('system')
  const [initialTemp, setInitialTemp] = useState<number | null>(null)
  const [pendingTemp, setPendingTemp] = useState<number>(0.7)
  const [saving, setSaving] = useState(false)
  const [initialName, setInitialName] = useState<string>(user.name || '')
  const [initialImage, setInitialImage] = useState<string>(user.image || '')
  const [pendingName, setPendingName] = useState<string>(user.name || '')
  const [pendingImage, setPendingImage] = useState<string>(user.image || '')
  const autoSavedRef = useRef(false)

  // Initialize pending values
  useEffect(() => {
    setPendingTheme(theme || 'system')
  }, [theme])
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('ai-temp')
      if (stored) {
        const num = parseFloat(stored)
        if (!isNaN(num)) { setInitialTemp(num); setPendingTemp(num); return }
      }
      setInitialTemp(0.7)
    }
  }, [])

  const profileDirty = pendingName !== initialName || pendingImage !== initialImage
  const appearanceDirty = pendingTheme !== (theme || 'system')
  const aiDirty = (initialTemp !== null && pendingTemp !== initialTemp)
  const dirty = profileDirty || appearanceDirty || aiDirty
  const profileInvalid = pendingName.trim().length < 2 || pendingName.trim().length > 80

  const saveAll = async () => {
    if (!dirty || profileInvalid) return
    setSaving(true)
    try {
      // 1. Save profile first (server) so that if it fails we don't apply local changes prematurely
      if (profileDirty) {
        const res = await fetch('/api/recruiter/settings/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: pendingName.trim(), image: pendingImage.trim() || null })
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Nie udało się zapisać profilu')
        setInitialName(pendingName)
        setInitialImage(pendingImage)
      }

      // 2. Apply theme
      if (appearanceDirty) setTheme(pendingTheme)

      // 3. Persist AI temp
      if (aiDirty && typeof window !== 'undefined') {
        window.localStorage.setItem('ai-temp', String(pendingTemp))
        window.dispatchEvent(new CustomEvent('ai-settings:changed', { detail: { temperature: pendingTemp } }))
        setInitialTemp(pendingTemp)
      }

      toast({ title: 'Zapisano', description: 'Wszystkie zmiany zostały zapisane.' })
    } catch (e: any) {
      toast({ title: 'Błąd', description: e.message || 'Nie udało się zapisać ustawień.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // Silent auto-save logic for navigation/tab close. Uses sendBeacon for profile to avoid blocking unload.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const runAutoSave = () => {
      if (autoSavedRef.current) return
      if (!dirty || profileInvalid) return
      autoSavedRef.current = true
      try {
        // Profile via beacon / keepalive fetch
        if (profileDirty) {
          const body = JSON.stringify({ name: pendingName.trim(), image: pendingImage.trim() || null })
          let sent = false
          try {
            if (navigator.sendBeacon) {
              const blob = new Blob([body], { type: 'application/json' })
              sent = navigator.sendBeacon('/api/recruiter/settings/profile', blob)
            }
          } catch { /* ignore */ }
          if (!sent) {
            // Fallback keepalive fetch (non-blocking best effort)
            fetch('/api/recruiter/settings/profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body,
              keepalive: true
            }).catch(() => {})
          }
          setInitialName(pendingName)
          setInitialImage(pendingImage)
        }
        // Theme
        if (appearanceDirty) {
          setTheme(pendingTheme)
        }
        // AI temperature
        if (aiDirty) {
          window.localStorage.setItem('ai-temp', String(pendingTemp))
          window.dispatchEvent(new CustomEvent('ai-settings:changed', { detail: { temperature: pendingTemp } }))
          setInitialTemp(pendingTemp)
        }
      } catch { /* swallow */ }
    }

    const handleBeforeUnload = () => runAutoSave()
    const handleVisibility = () => { if (document.visibilityState === 'hidden') runAutoSave() }
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [dirty, profileDirty, appearanceDirty, aiDirty, profileInvalid, pendingName, pendingImage, pendingTheme, pendingTemp, setTheme])

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Tabs defaultValue="profile" className="w-full">
        <div className="sticky top-0 z-20 -mx-6 px-6 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex items-center justify-between gap-4">
            <TabsList className="w-full flex gap-1 overflow-x-auto md:overflow-visible justify-start rounded-none bg-transparent h-auto p-0">
              <div className="flex w-full gap-1 py-2">
                <TabsTrigger className="flex-none px-4 py-2 rounded-md data-[state=active]:bg-muted" value="profile">Profil</TabsTrigger>
                <TabsTrigger className="flex-none px-4 py-2 rounded-md data-[state=active]:bg-muted" value="appearance">Wygląd</TabsTrigger>
                <TabsTrigger className="flex-none px-4 py-2 rounded-md data-[state=active]:bg-muted" value="ai">AI</TabsTrigger>
                <TabsTrigger className="flex-none px-4 py-2 rounded-md data-[state=active]:bg-muted" value="notifications">Powiadomienia</TabsTrigger>
              </div>
            </TabsList>
            <div className="py-2">
              <Button size="sm" onClick={saveAll} disabled={!dirty || saving || profileInvalid} className="gap-2">
                {saving ? 'Zapisywanie...' : (<><Save className="h-4 w-4" /> Zapisz zmiany</>)}
              </Button>
            </div>
          </div>
        </div>
        <div className="pt-4">
          <TabsContent value="profile" className="space-y-6">
            <ProfileForm name={pendingName} image={pendingImage} onChange={(field, value) => {
              if (field === 'name') setPendingName(value)
              else setPendingImage(value)
            }} />
          </TabsContent>
          <TabsContent value="appearance" className="space-y-6">
            <ThemeSettings value={pendingTheme} onChange={setPendingTheme} />
          </TabsContent>
          <TabsContent value="ai" className="space-y-6">
            <AISettings value={pendingTemp} onChange={setPendingTemp} />
          </TabsContent>
          <TabsContent value="notifications" className="space-y-6">
            <NotificationsSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
