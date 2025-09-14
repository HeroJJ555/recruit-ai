"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor, Mail, Send } from "lucide-react"

interface UserLite { name?: string | null; email?: string | null; image?: string | null }

function ThemeSettings() {
  const { theme, setTheme } = useTheme()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Motyw kolorystyczny</CardTitle>
        <CardDescription>Dostosuj wygląd aplikacji do swoich preferencji.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("light")}
            className="flex items-center gap-2 h-12"
          >
            <Sun className="h-4 w-4" />
            <div className="text-left">
              <div className="text-sm">Jasny</div>
              <div className="text-xs text-muted-foreground">Zawsze jasny</div>
            </div>
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("dark")}
            className="flex items-center gap-2 h-12"
          >
            <Moon className="h-4 w-4" />
            <div className="text-left">
              <div className="text-sm">Ciemny</div>
              <div className="text-xs text-muted-foreground">Zawsze ciemny</div>
            </div>
          </Button>
          <Button
            variant={theme === "system" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("system")}
            className="flex items-center gap-2 h-12"
          >
            <Monitor className="h-4 w-4" />
            <div className="text-left">
              <div className="text-sm">System</div>
              <div className="text-xs text-muted-foreground">Auto</div>
            </div>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Wybierz motyw lub zostaw automatyczny dobór na podstawie ustawień systemu.
        </p>
      </CardContent>
    </Card>
  )
}

function AISettings() {
  const [temperature, setTemperature] = useState(0.7)
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem("ai-temp") : null
    if (stored) {
      const num = parseFloat(stored)
      if (!isNaN(num)) setTemperature(num)
    }
  }, [])
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem("ai-temp", String(temperature))
      window.dispatchEvent(new CustomEvent('ai-settings:changed', { detail: { temperature } }))
    }
  }, [temperature])
  return (
    <Card>
      <CardHeader>
        <CardTitle>Asystent AI</CardTitle>
        <CardDescription>Minimalne dostosowanie kreatywności odpowiedzi.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Temperatura: {temperature}</label>
          <input type="range" min={0} max={1} step={0.05} value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))} className="w-full" />
          <p className="text-xs text-muted-foreground">0 = deterministycznie, 1 = bardziej swobodnie.</p>
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

function ProfileForm({ user }: { user: UserLite }) {
  const [name, setName] = useState(user.name || "")
  const [image, setImage] = useState(user.image || "")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/recruiter/settings/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, image }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Błąd zapisu')
      setMessage('Zapisano zmiany.')
      router.refresh()
    } catch (err: any) {
      setMessage('Błąd: ' + err.message)
    } finally {
      setSaving(false)
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil</CardTitle>
        <CardDescription>Podstawowe informacje identyfikujące rekrutera.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Imię / nazwa</label>
            <Input value={name} onChange={e => setName(e.target.value)} minLength={2} maxLength={80} required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">URL zdjęcia (opcjonalne)</label>
            <Input value={image} onChange={e => setImage(e.target.value)} placeholder="https://..." />
          </div>
            <div className="flex items-center gap-3 pt-2">
            <Button type="submit" size="sm" disabled={saving}>{saving ? 'Zapisywanie...' : 'Zapisz'}</Button>
            {message && <p className="text-xs text-muted-foreground">{message}</p>}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default function ClientSettingsTabs({ user }: { user: UserLite }) {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <Tabs defaultValue="profile" className="w-full">
        <div className="sticky top-0 z-10 -mx-6 px-6 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <TabsList className="w-full flex gap-1 overflow-x-auto md:overflow-visible justify-start rounded-none bg-transparent border-b border-border h-auto p-0">
            <div className="flex w-full gap-1 py-2">
              <TabsTrigger className="flex-none px-4 py-2 rounded-md data-[state=active]:bg-muted" value="profile">Profil</TabsTrigger>
              <TabsTrigger className="flex-none px-4 py-2 rounded-md data-[state=active]:bg-muted" value="appearance">Wygląd</TabsTrigger>
              <TabsTrigger className="flex-none px-4 py-2 rounded-md data-[state=active]:bg-muted" value="ai">AI</TabsTrigger>
              <TabsTrigger className="flex-none px-4 py-2 rounded-md data-[state=active]:bg-muted" value="email">Email</TabsTrigger>
              <TabsTrigger className="flex-none px-4 py-2 rounded-md data-[state=active]:bg-muted" value="notifications">Powiadomienia</TabsTrigger>
            </div>
          </TabsList>
        </div>
        <div className="pt-4">
          <TabsContent value="profile" className="space-y-6">
            <ProfileForm user={user} />
          </TabsContent>
          <TabsContent value="appearance" className="space-y-6">
            <ThemeSettings />
          </TabsContent>
          <TabsContent value="ai" className="space-y-6">
            <AISettings />
          </TabsContent>
          <TabsContent value="email" className="space-y-6">
            <EmailTestSettings />
          </TabsContent>
          <TabsContent value="notifications" className="space-y-6">
            <NotificationsSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
