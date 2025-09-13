"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface UserLite { name?: string | null; email?: string | null; image?: string | null }

function AISettings() {
  const [model, setModel] = useState("microsoft/Phi-3.5-mini-instruct")
  const [temperature, setTemperature] = useState(0.7)

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem("ai-prefs") : null
    if (stored) {
      try {
        const j = JSON.parse(stored)
        if (j.model) setModel(j.model)
        if (typeof j.temperature === 'number') setTemperature(j.temperature)
      } catch {}
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem("ai-prefs", JSON.stringify({ model, temperature }))
    }
  }, [model, temperature])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferencje AI</CardTitle>
        <CardDescription>Konfiguracja zachowania asystenta (lokalnie w przeglądarce).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Model</label>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-background"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="microsoft/Phi-3.5-mini-instruct">Phi-3.5-mini-instruct (lekki)</option>
            <option value="Qwen/Qwen2.5-1.5B-Instruct">Qwen2.5-1.5B-Instruct</option>
            <option value="Qwen/Qwen2.5-7B-Instruct">Qwen2.5-7B-Instruct</option>
          </select>
          <p className="text-xs text-muted-foreground">Zmiana modelu nie wysyła nic na serwer – odczytywana lokalnie przez UI.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Temperatura: {temperature}</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">Niższa = bardziej zachowawcze odpowiedzi. Wyższa = więcej kreatywności.</p>
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

function SecuritySettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bezpieczeństwo</CardTitle>
        <CardDescription>Zarządzanie sesjami i dostępem.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button size="sm" variant="outline" disabled>Resetuj wszystkie sesje (Wkrótce)</Button>
        <p className="text-xs text-muted-foreground">Po wdrożeniu: unieważnianie tokenów sesyjnych i wymuszanie ponownego logowania.</p>
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
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="profile">Profil</TabsTrigger>
        <TabsTrigger value="ai">AI</TabsTrigger>
        <TabsTrigger value="notifications">Powiadomienia</TabsTrigger>
        <TabsTrigger value="security">Bezpieczeństwo</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="space-y-6">
        <ProfileForm user={user} />
      </TabsContent>
      <TabsContent value="ai" className="space-y-6">
        <AISettings />
        <div className="text-xs text-muted-foreground">Asystent używa wybranego modelu tylko po stronie interfejsu (bez wysyłania ustawień na serwer).</div>
      </TabsContent>
      <TabsContent value="notifications" className="space-y-6">
        <NotificationsSettings />
      </TabsContent>
      <TabsContent value="security" className="space-y-6">
        <SecuritySettings />
      </TabsContent>
    </Tabs>
  )
}
