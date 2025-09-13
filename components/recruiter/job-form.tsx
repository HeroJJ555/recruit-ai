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

interface JobFormProps { 
  onCreated?: (id: string) => void 
  editMode?: boolean
  initialData?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export function JobForm({ onCreated, editMode = false, initialData, onSuccess, onCancel }: JobFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [publish, setPublish] = useState(editMode ? initialData?.status === 'OPEN' : true)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    try {
      const getFieldValue = (field: string) => {
        const value = formData.get(field)?.toString()?.trim()
        return value && value.length > 0 ? value : null
      }

      const payload = {
        title: formData.get("title")?.toString() || "",
        department: getFieldValue("department"),
        location: getFieldValue("location"),
        employmentType: getFieldValue("employmentType"),
        seniority: getFieldValue("seniority"),
        description: formData.get("description")?.toString() || "",
        requirements: getFieldValue("requirements"),
        responsibilities: getFieldValue("responsibilities"),
        benefits: getFieldValue("benefits"),
        openings: Number(formData.get("openings") || 1),
        goldenCandidate: {
          role: getFieldValue("goldenRole"),
          level: getFieldValue("goldenLevel"),
          skills: getFieldValue("goldenSkills"),
          summary: getFieldValue("goldenSummary"),
        },
        publish,
      }

      console.log("Sending payload:", JSON.stringify(payload, null, 2))

      const url = editMode ? `/api/recruiter/jobs/${initialData.id}` : "/api/recruiter/jobs"
      const method = editMode ? "PATCH" : "POST"
      
      const res = await fetch(url, { method, body: JSON.stringify(payload) })
      
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `Nie udało się ${editMode ? 'zaktualizować' : 'utworzyć'} oferty`)
      }

      const result = await res.json()
      
      if (editMode) {
        onSuccess?.()
      } else {
        setOpen(false)
        onCreated?.(result.id)
        router.refresh()
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const formContent = (
    <form action={handleSubmit} className="space-y-8">
      <fieldset className="space-y-6">
        <legend className="font-semibold text-sm tracking-wide text-muted-foreground">Podstawowe informacje</legend>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <Label htmlFor="title">Tytuł *</Label>
            <Input 
              id="title" 
              name="title" 
              required 
              minLength={3} 
              placeholder="np. Senior Frontend Developer"
              defaultValue={editMode ? initialData?.title : ""}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="department">Dział</Label>
            <Input 
              id="department" 
              name="department" 
              placeholder="IT / Marketing"
              defaultValue={editMode ? initialData?.department : ""}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="location">Lokalizacja</Label>
            <Input 
              id="location" 
              name="location" 
              placeholder="Warszawa / Zdalnie"
              defaultValue={editMode ? initialData?.location : ""}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="employmentType">Typ zatrudnienia</Label>
            <Input 
              id="employmentType" 
              name="employmentType" 
              placeholder="pełny etat"
              defaultValue={editMode ? initialData?.employmentType : ""}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="seniority">Poziom</Label>
            <Input 
              id="seniority" 
              name="seniority" 
              placeholder="mid"
              defaultValue={editMode ? initialData?.seniority : ""}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="openings">Liczba wakatów</Label>
            <Input 
              id="openings" 
              name="openings" 
              type="number" 
              min={1} 
              defaultValue={editMode ? initialData?.openings : 1}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-6">
        <legend className="font-semibold text-sm tracking-wide text-muted-foreground">Opis i wymagania</legend>
        <div className="space-y-3">
          <Label htmlFor="description">Opis *</Label>
          <Textarea 
            id="description" 
            name="description" 
            required 
            rows={5} 
            placeholder="Krótki opis stanowiska oraz jego celu."
            defaultValue={editMode ? initialData?.description : ""}
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="requirements">Wymagania</Label>
          <Textarea 
            id="requirements" 
            name="requirements" 
            rows={4} 
            placeholder="Wymagane technologie / doświadczenie"
            defaultValue={editMode ? initialData?.requirements : ""}
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="benefits">Benefity</Label>
          <Textarea 
            id="benefits" 
            name="benefits" 
            rows={4} 
            placeholder="Dodatki, pakiety, kultura, itd."
            defaultValue={editMode ? initialData?.benefits : ""}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-6">
        <legend className="font-semibold text-sm tracking-wide text-muted-foreground">Złoty Kandydat (Idealny profil)</legend>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <Label htmlFor="goldenRole">Rola</Label>
            <Input 
              id="goldenRole" 
              name="goldenRole" 
              placeholder="np. Senior Frontend Developer"
              defaultValue={editMode ? initialData?.goldenCandidate?.role : ""}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="goldenLevel">Poziom</Label>
            <Input 
              id="goldenLevel" 
              name="goldenLevel" 
              placeholder="junior / mid / senior / lead"
              defaultValue={editMode ? initialData?.goldenCandidate?.level : ""}
            />
          </div>
          <div className="space-y-3 lg:col-span-1 sm:col-span-2">
            <Label htmlFor="goldenSkills">Kluczowe umiejętności</Label>
            <Input 
              id="goldenSkills" 
              name="goldenSkills" 
              placeholder="np. React, TypeScript, Node.js"
              defaultValue={editMode ? initialData?.goldenCandidate?.skills : ""}
            />
          </div>
        </div>
        <div className="space-y-3">
          <Label htmlFor="goldenSummary">Krótki opis idealnego kandydata</Label>
          <Textarea 
            id="goldenSummary" 
            name="goldenSummary" 
            rows={3} 
            placeholder="Czego dokładnie szukamy?"
            defaultValue={editMode ? initialData?.goldenCandidate?.summary : ""}
          />
        </div>
      </fieldset>

      <div className="flex items-center gap-3 pt-2">
        <Switch id="publish" checked={publish} onCheckedChange={setPublish} />
        <Label htmlFor="publish" className="text-sm">
          {editMode ? "Opublikowana" : "Opublikuj od razu"}
        </Label>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-3 pt-2 border-t mt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={editMode ? onCancel : () => setOpen(false)} 
          disabled={loading}
        >
          Anuluj
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Zapisywanie..." : editMode ? "Zaktualizuj" : "Zapisz"}
        </Button>
      </div>
    </form>
  )

  if (editMode) {
    return formContent
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
        {formContent}
      </DialogContent>
    </Dialog>
  )
}
