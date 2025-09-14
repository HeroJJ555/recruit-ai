"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Eye, FileDown, MoreVertical, Clock, Eye as EyeIcon, Calendar, CheckCircle, XCircle, MinusCircle, Sparkles, MessageCircle } from "lucide-react"
import Link from "next/link"
import { BulkActionsModal, SingleActionModal } from "@/components/recruiter/actions-modals"
import { CreateMeetingDialog } from "@/components/recruiter/create-meeting-dialog"

type AppItem = {
  id: string
  firstName: string
  lastName: string
  email: string
  position: string
  experience: string
  createdAt: string | Date
  cvFileName?: string | null
  status?: string
}

export function CandidatesTable({ items }: { items: AppItem[] }) {
  const [rows, setRows] = useState<AppItem[]>(items)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkOpen, setBulkOpen] = useState(false)
  const [singleOpen, setSingleOpen] = useState<string | null>(null)
  const [meetingOpen, setMeetingOpen] = useState(false)
  const [meetingCandidateId, setMeetingCandidateId] = useState<string | undefined>()

  const allSelected = rows.length > 0 && selected.size === rows.length
  const selectedIds = useMemo(() => Array.from(selected), [selected])

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(rows.map(r => r.id)) : new Set())
  }

  const toggleRow = (id: string, checked: boolean) => {
    const s = new Set(selected)
    if (checked) s.add(id)
    else s.delete(id)
    setSelected(s)
  }

  const toPrismaStatus = (s: string): string => {
    switch (s) {
      case 'rejected': return 'REJECTED'
      case 'waiting': return 'WAITING'
      case 'interview': return 'INTERVIEW'
      case 'hired': return 'HIRED'
      case 'withdrawn': return 'WITHDRAWN'
      default: return 'PENDING'
    }
  }

  const onUpdated = (status: string) => {
    const prismaStatus = toPrismaStatus(status)
    if (selected.size > 0) {
      const ids = new Set(selected)
      setRows(prev => prev.map(r => ids.has(r.id) ? { ...r, status: prismaStatus } : r))
      setSelected(new Set())
    }
  }

  const openSchedule = (id: string) => {
    setMeetingCandidateId(id)
    setMeetingOpen(true)
  }

  const fmtDate = (d: string | Date) => new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(d))

  const statusBadge = (s?: string) => {
    const v = String(s || '').toUpperCase()
    const base = 'px-2 py-0.5 rounded-full text-xs font-medium border'
    switch (v) {
      case 'PENDING': return <span className={`${base} bg-amber-50 text-amber-700 border-amber-200 inline-flex items-center gap-1`}><Sparkles className="h-3.5 w-3.5"/> Nowe</span>
      case 'WAITING': return <span className={`${base} bg-gray-50 text-gray-700 border-gray-200 inline-flex items-center gap-1`}><Clock className="h-3.5 w-3.5"/> Oczekuje</span>
      case 'REVIEWED': return <span className={`${base} bg-blue-50 text-blue-700 border-blue-200 inline-flex items-center gap-1`}><EyeIcon className="h-3.5 w-3.5"/> Przejrzane</span>
      case 'CONTACTED': return <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200 inline-flex items-center gap-1`}><MessageCircle className="h-3.5 w-3.5"/> Skontaktowano</span>
      case 'INTERVIEW': return <span className={`${base} bg-indigo-50 text-indigo-700 border-indigo-200 inline-flex items-center gap-1`}><Calendar className="h-3.5 w-3.5"/> Rozmowa</span>
      case 'INTERVIEW_SCHEDULED': return <span className={`${base} bg-indigo-50 text-indigo-700 border-indigo-200 inline-flex items-center gap-1`}><Calendar className="h-3.5 w-3.5"/> Zaplanowano rozmowę</span>
      case 'INTERVIEW_COMPLETED': return <span className={`${base} bg-violet-50 text-violet-700 border-violet-200 inline-flex items-center gap-1`}><CheckCircle className="h-3.5 w-3.5"/> Rozmowa zakończona</span>
      case 'HIRED': return <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200 inline-flex items-center gap-1`}><CheckCircle className="h-3.5 w-3.5"/> Zatrudniony</span>
      case 'REJECTED': return <span className={`${base} bg-rose-50 text-rose-700 border-rose-200 inline-flex items-center gap-1`}><XCircle className="h-3.5 w-3.5"/> Odrzucony</span>
      case 'WITHDRAWN': return <span className={`${base} bg-zinc-50 text-zinc-700 border-zinc-200 inline-flex items-center gap-1`}><MinusCircle className="h-3.5 w-3.5"/> Wycofany</span>
      default: return <span className={`${base} bg-gray-50 text-gray-700 border-gray-200`}>{s || 'Status'}</span>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Zgłoszenia</CardTitle>
            <CardDescription>Ostatnie {rows.length} aplikacji</CardDescription>
          </div>
          {selected.size > 0 && (
            <Button variant="outline" size="sm" onClick={() => setBulkOpen(true)}>
              Akcje masowe ({selected.size})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={allSelected} onCheckedChange={(c) => toggleAll(Boolean(c))} />
                </TableHead>
                <TableHead>Imię i nazwisko</TableHead>
                <TableHead>Stanowisko</TableHead>
                <TableHead>Doświadczenie</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <Checkbox checked={selected.has(a.id)} onCheckedChange={(c) => toggleRow(a.id, Boolean(c))} />
                  </TableCell>
                  <TableCell className="font-medium">{a.firstName} {a.lastName}</TableCell>
                  <TableCell>{a.position}</TableCell>
                  <TableCell className="capitalize">{a.experience}</TableCell>
                  <TableCell>{statusBadge(a.status)}</TableCell>
                  <TableCell>{a.email}</TableCell>
                  <TableCell>{fmtDate(a.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link href={`/recruiter/candidates/${a.id}`} prefetch={false} aria-label="Profil">
                        <Button size="icon" variant="secondary" className="rounded-full"><Eye className="h-4 w-4" /></Button>
                      </Link>
                      {a.cvFileName ? (
                        <Link href={`/api/candidate/applications/${a.id}/cv`} prefetch={false} aria-label="Pobierz CV">
                          <Button size="icon" variant="secondary" className="rounded-full"><FileDown className="h-4 w-4" /></Button>
                        </Link>
                      ) : (
                        <Button size="icon" variant="outline" className="rounded-full" disabled aria-label="Brak CV"><FileDown className="h-4 w-4" /></Button>
                      )}
                      <Button size="icon" variant="outline" className="rounded-full" onClick={() => setSingleOpen(a.id)} aria-label="Akcje">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">Brak zgłoszeń</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Modals */}
      <BulkActionsModal
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        selectedCount={selected.size}
        candidateIds={selectedIds}
        onUpdated={onUpdated}
        onScheduleInterview={openSchedule}
      />
      <SingleActionModal
        open={Boolean(singleOpen)}
        onOpenChange={(o) => { if (!o) setSingleOpen(null) }}
        candidateId={singleOpen || ''}
        onDone={(st) => {
          const prismaStatus = toPrismaStatus(st)
          if (singleOpen) setRows(prev => prev.map(r => r.id === singleOpen ? { ...r, status: prismaStatus } : r))
          setSingleOpen(null)
        }}
        onScheduleInterview={openSchedule}
      />
      <CreateMeetingDialog
        open={meetingOpen}
        onOpenChange={setMeetingOpen}
        selectedCandidateId={meetingCandidateId}
      />
    </Card>
  )
}
