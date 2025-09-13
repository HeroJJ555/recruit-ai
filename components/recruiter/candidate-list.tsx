"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, Calendar, Eye, FileDown } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"
import { useEffect, useState } from "react"

export function CandidateList() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadCandidates() {
      try {
        const res = await fetch("/api/candidate/applications")
        if (res.ok) {
          const data = await res.json()
          setCandidates(data.items || [])
        }
      } catch (error) {
        console.error("Failed to load candidates:", error)
      } finally {
        setLoading(false)
      }
    }
    loadCandidates()
  }, [])

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Najnowsi kandydaci</CardTitle>
        <CardDescription>Ostatnio przesłane wnioski kandydatów</CardDescription>
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
                const name = `${candidate.firstName ?? ""} ${candidate.lastName ?? ""}`.trim()
                const skills = candidate.skills ? (candidate.skills as string).split(",").map((s: string) => s.trim()).filter(Boolean) : []
                const appliedDate = candidate.createdAt ? formatDistanceToNow(new Date(candidate.createdAt), { addSuffix: true, locale: pl }) : "-"

                return (
                  <div
                    key={candidate.id}
                    onClick={() => router.push(`/recruiter/candidates/${candidate.id}`)}
                    className="group flex items-center justify-between p-4 border rounded-lg hover:bg-accent/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-4 shrink-0">
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
                    <div className="flex items-center space-x-4 shrink-0">
                      <div className="text-center">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className={`font-semibold ${getScoreColor(undefined)}`}>{"-"}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Dopasowanie AI</p>
                      </div>
                      <TooltipProvider>
                        <div className="flex items-center gap-1 shrink-0 min-w-[84px] justify-end">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link href={`/recruiter/candidates/${candidate.id}`} prefetch={false} onClick={(e) => e.stopPropagation()} aria-label="Profil">
                                <Button variant="secondary" size="icon" className="rounded-full">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>Profil</TooltipContent>
                          </Tooltip>
                          {candidate.cvFileName ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/api/candidate/applications/${candidate.id}/cv`} prefetch={false} onClick={(e) => e.stopPropagation()} aria-label="Pobierz CV">
                                  <Button variant="secondary" size="icon" className="rounded-full">
                                    <FileDown className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>Pobierz CV</TooltipContent>
                            </Tooltip>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="rounded-full" disabled onClick={(e) => e.stopPropagation()} aria-label="Brak CV">
                                  <FileDown className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Brak CV</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TooltipProvider>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}