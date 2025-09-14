"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Star, Calendar, Eye, FileDown, MoreVertical, X, Clock, CheckCircle, Brain, CalendarPlus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"
import { useEffect, useState } from "react"
import { CreateMeetingDialog } from "@/components/recruiter/create-meeting-dialog"

export function CandidateList() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set())
  const [createMeetingDialogOpen, setCreateMeetingDialogOpen] = useState(false)
  const [selectedCandidateForMeeting, setSelectedCandidateForMeeting] = useState<string | undefined>()
  const router = useRouter()

  useEffect(() => {
    loadCandidates()
  }, [])

  const loadCandidates = async () => {
    try {
      const res = await fetch("/api/candidate/applications")
      if (res.ok) {
        const data = await res.json()
        console.log("Candidates data:", data) // Debug log
        setCandidates(data.items || [])
      }
    } catch (error) {
      console.error("Failed to load candidates:", error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number | null | undefined) => {
    if ((score ?? 0) >= 90) return "text-green-600"
    if ((score ?? 0) >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const getExpLabel = (exp?: string | null) => ({
    junior: "Junior",
    mid: "Mid",
    senior: "Senior",
    lead: "Lead",
  } as any)[(exp || "").toLowerCase()] || "-"

  const handleSelectCandidate = (candidateId: string, checked: boolean) => {
    const newSelected = new Set(selectedCandidates)
    if (checked) {
      newSelected.add(candidateId)
    } else {
      newSelected.delete(candidateId)
    }
    setSelectedCandidates(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCandidates(new Set(candidates.map(c => c.id)))
    } else {
      setSelectedCandidates(new Set())
    }
  }

  const handleBulkAction = async (action: 'reject' | 'waiting' | 'interview' | 'ai-decision') => {
    const selectedIds = Array.from(selectedCandidates)
    if (selectedIds.length === 0) return

    if (action === 'ai-decision') {
      // Przekieruj do asystenta AI z pytaniem o decyzję
      const candidateNames = candidates
        .filter(c => selectedIds.includes(c.id))
        .map(c => `${c.firstName} ${c.lastName}`)
        .join(', ')
      const question = `Pomóż mi podjąć decyzję co zrobić z tymi kandydatami: ${candidateNames}. Przeanalizuj ich profile i zaproponuj czy odrzucić, zaprosić na rozmowę czy poczekać.`
      router.push(`/recruiter/ai-assistant?q=${encodeURIComponent(question)}`)
      return
    }

    if (action === 'interview') {
      // Jeśli zaznaczono tylko jednego kandydata, otwórz dialog tworzenia spotkania
      if (selectedIds.length === 1) {
        setSelectedCandidateForMeeting(selectedIds[0])
        setCreateMeetingDialogOpen(true)
        return
      }
    }

    try {
      const response = await fetch('/api/candidate/bulk-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateIds: selectedIds,
          action: action === 'interview' ? 'INTERVIEW' : action === 'reject' ? 'REJECTED' : 'WAITING'
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`Bulk action success: ${result.message}`)
        
        // Update local state
        setCandidates(prev => prev.map(candidate => 
          selectedIds.includes(candidate.id) 
            ? { ...candidate, status: action === 'interview' ? 'INTERVIEW' : action === 'reject' ? 'REJECTED' : 'WAITING' }
            : candidate
        ))
        
        // Reset selection
        setSelectedCandidates(new Set())
      } else {
        const error = await response.json()
        console.error('Bulk action failed:', error.error)
      }
    } catch (error) {
      console.error('Bulk action error:', error)
    }
  }

  const handleScheduleMeeting = (candidateId: string) => {
    setSelectedCandidateForMeeting(candidateId)
    setCreateMeetingDialogOpen(true)
  }

  const handleMeetingCreated = () => {
    // Refresh candidates list to reflect any status changes
    loadCandidates()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Najnowsi kandydaci</CardTitle>
            <CardDescription>Ostatnio przesłane wnioski kandydatów</CardDescription>
          </div>
          {selectedCandidates.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Zaznaczono: {selectedCandidates.size}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Akcje masowe
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkAction('reject')}>
                    <X className="h-4 w-4 mr-2" />
                    Odrzuć
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('waiting')}>
                    <Clock className="h-4 w-4 mr-2" />
                    Oczekuje
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('interview')}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Zaproś na rozmowę
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleBulkAction('ai-decision')}>
                    <Brain className="h-4 w-4 mr-2" />
                    Poproś AI o decyzję
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        {candidates.length > 0 && (
          <div className="flex items-center gap-2 pt-2">
            <Checkbox
              checked={selectedCandidates.size === candidates.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-muted-foreground">Zaznacz wszystkich</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {candidates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Brak zgłoszeń kandydatów</p>
            ) : (
              candidates.map((candidate: any) => {
                console.log("Rendering candidate:", candidate) // Debug log
                const name = `${candidate.firstName ?? ""} ${candidate.lastName ?? ""}`.trim()
                const skills = candidate.skills ? (candidate.skills as string).split(",").map((s: string) => s.trim()).filter(Boolean) : []
                const appliedDate = candidate.createdAt ? formatDistanceToNow(new Date(candidate.createdAt), { addSuffix: true, locale: pl }) : "-"
                const matchScore = candidate.cvAnalysis?.matchScore ?? null
                const hasAnalysis = !!candidate.cvAnalysis
                const analysisSource = candidate.cvAnalysis?.aiProvider || null

                return (
                  <div
                    key={candidate.id}
                    className="group flex items-center justify-between p-4 border rounded-lg hover:bg-accent/40 transition-colors"
                  >
                    <div className="flex items-center space-x-4 shrink-0">
                      <Checkbox
                        checked={selectedCandidates.has(candidate.id)}
                        onCheckedChange={(checked) => handleSelectCandidate(candidate.id, checked === true)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div 
                        onClick={() => router.push(`/recruiter/candidates/${candidate.id}`)}
                        className="flex items-center space-x-4 cursor-pointer"
                      >
                        <Avatar>
                          <AvatarFallback>
                            {name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{name || "Brak imienia"}</h4>
                            <Badge variant="outline">{getExpLabel(candidate.experience)}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">{candidate.position ?? "-"}</div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{appliedDate}</span>
                            </div>
                            <div className="truncate max-w-[220px]" title={candidate.email}>{candidate.email ?? "-"}</div>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {skills.slice(0, 3).map((skill: string) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 shrink-0">
                      <div className="text-center">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className={`font-semibold ${getScoreColor(matchScore)}`}>
                            {matchScore !== null ? `${Math.round(matchScore)}%` : "-"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {hasAnalysis ? (
                            analysisSource === 'heuristic' ? 'Analiza podstawowa' : 'Dopasowanie AI'
                          ) : (
                            'Brak analizy'
                          )}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => router.push(`/recruiter/candidates/${candidate.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Zobacz profil
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleScheduleMeeting(candidate.id)}>
                            <CalendarPlus className="h-4 w-4 mr-2" />
                            Zaplanuj spotkanie
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleBulkAction('reject')}>
                            <X className="h-4 w-4 mr-2" />
                            Odrzuć
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleBulkAction('waiting')}>
                            <Clock className="h-4 w-4 mr-2" />
                            Oczekuje
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleBulkAction('interview')}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Zaproś na rozmowę
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </CardContent>

      <CreateMeetingDialog
        open={createMeetingDialogOpen}
        onOpenChange={setCreateMeetingDialogOpen}
        selectedCandidateId={selectedCandidateForMeeting}
        onMeetingCreated={handleMeetingCreated}
      />
    </Card>
  )
}