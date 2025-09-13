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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Dodaj ofertę pracy</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Tytuł *</Label>
              <Input id="title" name="title" required minLength={3} />
            </div>
            <div>
              <Label htmlFor="department">Dział</Label>
              <Input id="department" name="department" />
            </div>
            <div>
              <Label htmlFor="location">Lokalizacja</Label>
              <Input id="location" name="location" />
            </div>
            <div>
              <Label htmlFor="employmentType">Typ zatrudnienia</Label>
              <Input id="employmentType" name="employmentType" placeholder="pełny etat" />
            </div>
            <div>
              <Label htmlFor="seniority">Poziom</Label>
              <Input id="seniority" name="seniority" placeholder="mid" />
            </div>
            <div>
              <Label htmlFor="openings">Liczba wakatów</Label>
              <Input id="openings" name="openings" type="number" min={1} defaultValue={1} />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Opis *</Label>
            <Textarea id="description" name="description" required rows={4} />
          </div>
          <div>
            <Label htmlFor="requirements">Wymagania</Label>
            <Textarea id="requirements" name="requirements" rows={3} />
          </div>
          <div>
            <Label htmlFor="benefits">Benefity</Label>
            <Textarea id="benefits" name="benefits" rows={3} />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="publish" checked={publish} onCheckedChange={setPublish} />
            <Label htmlFor="publish">Opublikuj od razu</Label>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Anuluj</Button>
            <Button type="submit" disabled={loading}>{loading ? "Zapisywanie..." : "Zapisz"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
