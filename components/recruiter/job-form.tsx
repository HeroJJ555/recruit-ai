"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

interface JobFormProps { onCreated?: (id: string) => void }

export function JobForm({ onCreated }: JobFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [publish, setPublish] = useState(true)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    try {
      const payload = {
        title: formData.get("title")?.toString() || "",
        department: formData.get("department")?.toString() || undefined,
        location: formData.get("location")?.toString() || undefined,
        employmentType: formData.get("employmentType")?.toString() || undefined,
        seniority: formData.get("seniority")?.toString() || undefined,
        description: formData.get("description")?.toString() || "",
        requirements: formData.get("requirements")?.toString() || undefined,
        benefits: formData.get("benefits")?.toString() || undefined,
        openings: Number(formData.get("openings") || 1),
        publish,
      }
      const res = await fetch("/api/recruiter/jobs", { method: "POST", body: JSON.stringify(payload) })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || "Nie udało się utworzyć oferty")
      }
  const created = await res.json()
      setOpen(false)
      onCreated?.(created.id)
  router.refresh()
    } catch (e:any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nowa oferta
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Dodaj ofertę pracy</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-8">
          <fieldset className="space-y-6">
            <legend className="font-semibold text-sm tracking-wide text-muted-foreground">Podstawowe informacje</legend>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-3">
                <Label htmlFor="title">Tytuł *</Label>
                <Input id="title" name="title" required minLength={3} placeholder="np. Senior Frontend Developer" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="department">Dział</Label>
                <Input id="department" name="department" placeholder="IT / Marketing" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="location">Lokalizacja</Label>
                <Input id="location" name="location" placeholder="Warszawa / Zdalnie" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="employmentType">Typ zatrudnienia</Label>
                <Input id="employmentType" name="employmentType" placeholder="pełny etat" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="seniority">Poziom</Label>
                <Input id="seniority" name="seniority" placeholder="mid" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="openings">Liczba wakatów</Label>
                <Input id="openings" name="openings" type="number" min={1} defaultValue={1} />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-6">
            <legend className="font-semibold text-sm tracking-wide text-muted-foreground">Opis i wymagania</legend>
            <div className="space-y-3">
              <Label htmlFor="description">Opis *</Label>
              <Textarea id="description" name="description" required rows={5} placeholder="Krótki opis stanowiska oraz jego celu." />
            </div>
            <div className="space-y-3">
              <Label htmlFor="requirements">Wymagania</Label>
              <Textarea id="requirements" name="requirements" rows={4} placeholder="Wymagane technologie / doświadczenie" />
            </div>
            <div className="space-y-3">
              <Label htmlFor="benefits">Benefity</Label>
              <Textarea id="benefits" name="benefits" rows={4} placeholder="Dodatki, pakiety, kultura, itd." />
            </div>
          </fieldset>

            <div className="flex items-center gap-3 pt-2">
              <Switch id="publish" checked={publish} onCheckedChange={setPublish} />
              <Label htmlFor="publish" className="text-sm">Opublikuj od razu</Label>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-3 pt-2 border-t mt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Anuluj</Button>
              <Button type="submit" disabled={loading}>{loading ? "Zapisywanie..." : "Zapisz"}</Button>
            </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
