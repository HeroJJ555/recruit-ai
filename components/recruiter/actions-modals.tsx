"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { X, Clock, CheckCircle } from "lucide-react"

type Action = 'reject' | 'waiting' | 'interview'

export function SingleActionModal({
  open,
  onOpenChange,
  candidateId,
  candidateName,
  onDone,
  onScheduleInterview
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidateId: string
  candidateName?: string
  onDone?: (newStatus: string) => void
  onScheduleInterview?: (candidateId: string) => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [action, setAction] = useState<Action>('waiting')

  const submit = async () => {
    if (action === 'interview') {
      onOpenChange(false)
      onScheduleInterview?.(candidateId)
      toast.info('Otworzono planowanie spotkania')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/candidate/bulk-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateIds: [candidateId], action })
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'Operacja nie powiodła się')
      }
      onDone?.(action)
      onOpenChange(false)
      toast.success('Zaktualizowano status kandydata')
    } catch (e) {
      console.error(e)
      const msg = (e as any)?.message || 'Nie udało się zaktualizować statusu'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Akcja dla kandydata</DialogTitle>
          <DialogDescription>
            Wybierz operację do wykonania{candidateName ? ` dla ${candidateName}` : ''}.
          </DialogDescription>
        </DialogHeader>
        <RadioGroup value={action} onValueChange={(v: Action) => setAction(v)} className="space-y-3">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="reject" id="single-reject" />
            <Label htmlFor="single-reject" className="flex items-center gap-2"><X className="h-4 w-4"/>Odrzuć</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="waiting" id="single-waiting" />
            <Label htmlFor="single-waiting" className="flex items-center gap-2"><Clock className="h-4 w-4"/>Oczekuje</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="interview" id="single-interview" />
            <Label htmlFor="single-interview" className="flex items-center gap-2"><CheckCircle className="h-4 w-4"/>Zaproś na rozmowę</Label>
          </div>
        </RadioGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Anuluj</Button>
          <Button onClick={submit} disabled={submitting}>{submitting ? 'Zapisywanie...' : 'Potwierdź'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function BulkActionsModal({
  open,
  onOpenChange,
  selectedCount,
  candidateIds,
  onUpdated,
  onScheduleInterview
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCount: number
  candidateIds: string[]
  onUpdated?: (newStatus: string) => void
  onScheduleInterview?: (candidateId: string) => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [action, setAction] = useState<Action>('waiting')

  const submit = async () => {
    if (action === 'interview' && candidateIds.length === 1) {
      onOpenChange(false)
      onScheduleInterview?.(candidateIds[0])
      toast.info('Otworzono planowanie spotkania')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/candidate/bulk-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateIds, action })
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'Operacja nie powiodła się')
      }
      onUpdated?.(action)
      onOpenChange(false)
      toast.success('Zaktualizowano status wybranych kandydatów')
    } catch (e) {
      console.error(e)
      const msg = (e as any)?.message || 'Nie udało się wykonać akcji masowej'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Akcje masowe</DialogTitle>
          <DialogDescription>
            Wybrano {selectedCount} {selectedCount === 1 ? 'kandydata' : 'kandydatów'}. Wybierz operację do wykonania.
          </DialogDescription>
        </DialogHeader>
        <RadioGroup value={action} onValueChange={(v: Action) => setAction(v)} className="space-y-3">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="reject" id="bulk-reject" />
            <Label htmlFor="bulk-reject" className="flex items-center gap-2"><X className="h-4 w-4"/>Odrzuć</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="waiting" id="bulk-waiting" />
            <Label htmlFor="bulk-waiting" className="flex items-center gap-2"><Clock className="h-4 w-4"/>Oczekuje</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="interview" id="bulk-interview" />
            <Label htmlFor="bulk-interview" className="flex items-center gap-2"><CheckCircle className="h-4 w-4"/>Zaproś na rozmowę</Label>
          </div>
        </RadioGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Anuluj</Button>
          <Button onClick={submit} disabled={submitting}>{submitting ? 'Zapisywanie...' : 'Potwierdź'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
