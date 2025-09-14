"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useRef, useState, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor, Save, Mail, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { broadcastUserProfile } from "@/lib/user-profile-sync"

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

function EmailTestSettings() {
  const [testEmail, setTestEmail] = useState("")
  const [subject, setSubject] = useState("Test wiadomości z systemu rekrutacyjnego")
  const [message, setMessage] = useState("To jest testowa wiadomość wysłana z systemu rekrutacyjnego. Jeśli ją otrzymałeś, oznacza to, że konfiguracja email działa poprawnie.")
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function sendTestEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!testEmail.trim()) {
      setResult("Wprowadź adres email")
      return
    }
    
    setSending(true)
    setResult(null)
    
    try {
      const res = await fetch('/api/mail/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmail.trim(),
          subject: subject.trim(),
          message: message.trim()
        })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Błąd wysyłania')
      }
      
      setResult(`✅ Email wysłany pomyślnie! ID: ${data.messageId || 'brak'}`)
    } catch (err: any) {
      setResult(`❌ Błąd: ${err.message}`)
    } finally {
      setSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Testowanie maili
        </CardTitle>
        <CardDescription>
          Wyślij testową wiadomość, aby sprawdzić czy konfiguracja email działa poprawnie.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={sendTestEmail} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Adres odbiorcy</label>
            <Input
              type="email"
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium">Temat</label>
            <Input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Temat wiadomości"
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium">Treść wiadomości</label>
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Treść testowej wiadomości..."
              rows={4}
              required
            />
          </div>
          
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" size="sm" disabled={sending}>
              <Send className="h-4 w-4 mr-2" />
              {sending ? 'Wysyłanie...' : 'Wyślij test'}
            </Button>
          </div>
          
          {result && (
            <div className={`text-sm p-3 rounded-md ${result.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {result}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

function ProfileForm({ name, image, onChange, firstName, lastName, onNameSplitChange, imageError }: { name: string; image: string; onChange: (field: 'name' | 'image', value: string) => void; firstName: string; lastName: string; onNameSplitChange: (which: 'first' | 'last', value: string) => void; imageError?: string | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil</CardTitle>
        <CardDescription>Podstawowe informacje identyfikujące rekrutera. Zapis nastąpi przy kliknięciu „Zapisz zmiany”.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Imię</label>
              <Input value={firstName} onChange={e => onNameSplitChange('first', e.target.value)} minLength={2} maxLength={60} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Nazwisko</label>
              <Input value={lastName} onChange={e => onNameSplitChange('last', e.target.value)} minLength={2} maxLength={80} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">URL zdjęcia (opcjonalne)</label>
            <Input value={image} onChange={e => onChange('image', e.target.value)} placeholder="https://..." />
            {imageError && <p className="text-xs text-destructive">{imageError}</p>}
          </div>
          <p className="text-xs text-muted-foreground">Zmiany w polach są rozsyłane natychmiast lokalnie (optimistic), ale trwały zapis nastąpi po przycisku lub autosave.</p>
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
  const [firstName, setFirstName] = useState<string>(() => (user.name?.split(' ')[0] || ''))
  const [lastName, setLastName] = useState<string>(() => {
    if (!user.name) return ''
    const parts = user.name.split(' ')
    return parts.slice(1).join(' ')
  })
  const autoSavedRef = useRef(false)
  const pathname = usePathname()
  const router = useRouter()

  // Derived flags (must be before callbacks using them)
  // URL validation for image to avoid spamming API with invalid payloads
  const isValidUrl = useCallback((val: string) => {
    if (!val) return true
    try { const u = new URL(val); return u.protocol === 'http:' || u.protocol === 'https:' } catch { return false }
  }, [])

  const imageError = pendingImage && pendingImage.trim().length > 0 && !isValidUrl(pendingImage.trim()) ? 'Nieprawidłowy URL' : null

  const profileDirty = pendingName !== initialName || pendingImage !== initialImage
  const appearanceDirty = pendingTheme !== (theme || 'system')
  const aiDirty = (initialTemp !== null && pendingTemp !== initialTemp)
  const dirty = profileDirty || appearanceDirty || aiDirty
  const profileInvalid = pendingName.trim().length < 2 || pendingName.trim().length > 80 || !!imageError

  const runAutoSave = useCallback(() => {
    if (autoSavedRef.current) return
    if (!dirty || profileInvalid) return
    autoSavedRef.current = true
    try {
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

      if (appearanceDirty) {
        setTheme(pendingTheme)
      }

      if (aiDirty) {
        window.localStorage.setItem('ai-temp', String(pendingTemp))
        window.dispatchEvent(new CustomEvent('ai-settings:changed', { detail: { temperature: pendingTemp } }))
        setInitialTemp(pendingTemp)
      }
    } catch { /* swallow */ }

  }, [dirty, profileInvalid, profileDirty, appearanceDirty, aiDirty, pendingName, pendingImage, pendingTheme, pendingTemp])


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


  const saveAll = async (opts?: { silent?: boolean }) => {
    if (!dirty || profileInvalid) return
    setSaving(true)
    try {
      if (profileDirty) {
        const res = await fetch('/api/recruiter/settings/profile', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: pendingName.trim(), image: pendingImage.trim() || null })
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Nie udało się zapisać profilu')
        setInitialName(pendingName)
        setInitialImage(pendingImage)
        router.refresh()
      }
      if (appearanceDirty) setTheme(pendingTheme)
      if (aiDirty && typeof window !== 'undefined') {
        window.localStorage.setItem('ai-temp', String(pendingTemp))
        window.dispatchEvent(new CustomEvent('ai-settings:changed', { detail: { temperature: pendingTemp } }))
        setInitialTemp(pendingTemp)
      }
      if (!opts?.silent) toast({ title: 'Zapisano', description: 'Wszystkie zmiany zostały zapisane.' })
    } catch (e: any) {
      if (!opts?.silent) toast({ title: 'Błąd', description: e.message || 'Nie udało się zapisać ustawień.', variant: 'destructive' })
    } finally { setSaving(false) }
  }


  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleBeforeUnload = () => runAutoSave()
    const handleVisibility = () => { if (document.visibilityState === 'hidden') runAutoSave() }
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      runAutoSave()
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [runAutoSave])

  const prevPathRef = useRef(pathname)
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      if (prevPathRef.current?.includes('/recruiter/settings')) {
        runAutoSave()
      }
      prevPathRef.current = pathname
    }
  }, [pathname, runAutoSave])

  const debounceRef = useRef<number | null>(null)
  useEffect(() => {
    if (!dirty || profileInvalid) return
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => { saveAll({ silent: true }) }, 1200)
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current) }
  }, [dirty, profileInvalid, pendingName, pendingImage, pendingTheme, pendingTemp])

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
                <TabsTrigger className="flex-none px-4 py-2 rounded-md data-[state=active]:bg-muted" value="email">Email</TabsTrigger>
              </div>
            </TabsList>
            <div className="py-2">
              <Button size="sm" onClick={() => saveAll()} disabled={!dirty || saving || profileInvalid} className="gap-2">
                {saving ? 'Zapisywanie...' : (<><Save className="h-4 w-4" /> Zapisz zmiany</>)}
              </Button>
            </div>
          </div>
        </div>
        <div className="pt-4">
          <TabsContent value="profile" className="space-y-6">
            <ProfileForm 
              name={pendingName} 
              image={pendingImage} 
              firstName={firstName}
              lastName={lastName}
              imageError={imageError}
              onNameSplitChange={(which, value) => {
                if (which === 'first') setFirstName(value)
                else setLastName(value)
                const combined = [which === 'first' ? value : firstName, which === 'last' ? value : lastName].filter(Boolean).join(' ')
                setPendingName(combined)
                broadcastUserProfile({ name: combined })
              }}
              onChange={(field, value) => {
                if (field === 'name') {
                  setPendingName(value)
                  // Derive split fields heuristically
                  const parts = value.trim().split(/\s+/)
                  if (parts.length > 1) { setFirstName(parts[0]); setLastName(parts.slice(1).join(' ')) }
                  else { setFirstName(value); setLastName('') }
                  broadcastUserProfile({ name: value })
                } else {
                  setPendingImage(value)
                  broadcastUserProfile({ image: value })
                }
              }} 
            />
          </TabsContent>
          <TabsContent value="appearance" className="space-y-6">
            <ThemeSettings value={pendingTheme} onChange={setPendingTheme} />
          </TabsContent>
          <TabsContent value="ai" className="space-y-6">
            <AISettings value={pendingTemp} onChange={setPendingTemp} />
          </TabsContent>
          <TabsContent value="email" className="space-y-6">
            <EmailTestSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
