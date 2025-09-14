"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, Sparkles, MessageSquare, Award, Briefcase, User, AlertCircle } from "lucide-react"

type Result = {
  summary?: string
  compatibility_score?: number
  compatibility_breakdown?: {
    skills_match?: number
    experience_level?: number
    role_fit?: number
  }
  key_highlights?: string[]
  technical_skills?: (string | { skill: string; match?: boolean })[]
  experience_summary?: {
    years?: number
    level?: string
    key_roles?: string[]
  }
  standout_projects?: string[]
  interview_questions?: string[]
  potential_concerns?: string[]
  recommendation?: {
    decision?: string
    reasoning?: string
    next_steps?: string
  }
}

export function CvAnalysis({ appId }: { appId: string }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = async (refresh = false) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/candidate/applications/${appId}/analyze${refresh ? '?refresh=1' : ''}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Analysis failed')
      setResult(json.result)
    } catch (e: any) {
      setError(e?.message || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-muted-foreground'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getDecisionBadge = (decision?: string) => {
    switch (decision) {
      case 'RECOMMEND':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Rekomenduj</Badge>
      case 'CONSIDER':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Rozważ</Badge>
      case 'REJECT':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Odrzuć</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => run(false)} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Analiza CV (AI)
        </Button>
        <Button size="sm" variant="outline" onClick={() => run(true)} disabled={loading}>Odśwież</Button>
      </div>
      
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
      
      {result && (
        <div className="space-y-6">
          {/* Summary & Score */}
          {result.summary && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Podsumowanie
                  </CardTitle>
                  {result.compatibility_score && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Dopasowanie:</span>
                      <span className={`text-lg font-bold ${getScoreColor(result.compatibility_score)}`}>
                        {result.compatibility_score}%
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 mb-4">{result.summary}</p>
                
                {result.key_highlights && result.key_highlights.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      Kluczowe atuty
                    </h4>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {result.key_highlights.map((highlight, i) => (
                        <li key={i}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Technical Skills & Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.technical_skills && result.technical_skills.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Umiejętności techniczne
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {result.technical_skills.map((skill, index) => {
                      // Obsługa różnych formatów: string lub obiekt
                      const skillName = typeof skill === 'string' ? skill : skill.skill
                      const isMatched = typeof skill === 'object' && skill.match
                      
                      return (
                        <Badge 
                          key={`${skillName}-${index}`} 
                          variant={isMatched ? "default" : "secondary"} 
                          className={`text-xs ${isMatched ? 'bg-green-100 text-green-800 border-green-200' : ''}`}
                        >
                          {skillName}
                          {isMatched && ' ✓'}
                        </Badge>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {result.experience_summary && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Doświadczenie</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.experience_summary.years && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Lata:</span> {result.experience_summary.years}
                    </div>
                  )}
                  {result.experience_summary.level && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Poziom:</span> {result.experience_summary.level}
                    </div>
                  )}
                  {result.experience_summary.key_roles && result.experience_summary.key_roles.length > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Role:</span> {result.experience_summary.key_roles.join(', ')}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Projects */}
          {result.standout_projects && result.standout_projects.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Wyróżniające się projekty</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 text-sm space-y-2">
                  {result.standout_projects.map((project, i) => (
                    <li key={i}>{project}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Interview Questions */}
          {result.interview_questions && result.interview_questions.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-blue-800">
                  <MessageSquare className="h-4 w-4" />
                  Sugerowane pytania na rozmowę
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.interview_questions.map((question, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="bg-blue-200 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm text-blue-900">{question}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Concerns */}
          {result.potential_concerns && result.potential_concerns.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-amber-800">
                  <AlertCircle className="h-4 w-4" />
                  Potencjalne obawy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {result.potential_concerns.map((concern, i) => (
                    <li key={i} className="text-amber-900">{concern}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recommendation */}
          {result.recommendation && (
            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Rekomendacja</CardTitle>
                  {getDecisionBadge(result.recommendation.decision)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.recommendation.reasoning && (
                  <p className="text-sm">{result.recommendation.reasoning}</p>
                )}
                {result.recommendation.next_steps && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Następne kroki:</h4>
                    <p className="text-sm text-muted-foreground">{result.recommendation.next_steps}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}