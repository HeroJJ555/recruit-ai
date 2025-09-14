"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, Sparkles, MessageSquare, Award, Briefcase, User, AlertCircle, RefreshCw } from "lucide-react"

type Result = {
  summary?: string
  compatibility_score?: number
  compatibility_breakdown?: {
    skills_match?: number
    experience_level?: number
    role_fit?: number
  }
  key_highlights?: string[]
  technical_skills?: string[] // Simplified to only strings
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

  // Automatyczne uruchomienie analizy przy załadowaniu komponentu
  useEffect(() => {
    // Reset state on app change and run fresh analysis
    setResult(null)
    setError(null)
    run(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId])

  const run = async (refresh = false) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/candidate/applications/${appId}/analyze${refresh ? '?refresh=1' : ''}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Analysis failed')
      
      // Add debug logging to see the data structure
      console.log('🔍 CV Analysis API Response:', json)
      console.log('🔍 Technical Skills Structure:', json.result?.technical_skills)
      console.log('🔍 Key Highlights Structure:', json.result?.key_highlights)
      
      // Validate and sanitize the result before setting state
      const sanitizedResult = sanitizeAnalysisResult(json.result)
      console.log('🔧 Sanitized Technical Skills:', sanitizedResult.technical_skills)
      console.log('🔧 Sanitized Key Highlights:', sanitizedResult.key_highlights)
      console.log('🔧 All skills are strings:', sanitizedResult.technical_skills?.every((s: any) => typeof s === 'string'))
      console.log('🔧 All highlights are strings:', sanitizedResult.key_highlights?.every((s: any) => typeof s === 'string'))
      setResult(sanitizedResult)
    } catch (e: any) {
      setError(e?.message || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  // Function to sanitize analysis result
  const sanitizeAnalysisResult = (result: any): Result => {
    if (!result || typeof result !== 'object') {
      return {}
    }

    // Helper function to sanitize any array to contain only strings
    const sanitizeArray = (arr: any[]): string[] => {
      if (!Array.isArray(arr)) return []
      return arr.map((item: any, index: number) => {
        try {
          if (typeof item === 'string') {
            return item
          } else if (item && typeof item === 'object') {
            // Extract first string value from object
            const values = Object.values(item).filter(v => typeof v === 'string')
            return values.length > 0 ? String(values[0]) : `Item ${index + 1}`
          } else {
            return String(item || `Item ${index + 1}`)
          }
        } catch (e) {
          return `Item ${index + 1}`
        }
      }).filter((item: string) => item && item.trim().length > 0)
    }

    // AGGRESSIVE sanitization - force everything to strings
    const sanitizedTechnicalSkills = sanitizeArray(result.technical_skills || [])
    const sanitizedKeyHighlights = sanitizeArray(result.key_highlights || [])
    const sanitizedStandoutProjects = sanitizeArray(result.standout_projects || [])
    const sanitizedInterviewQuestions = sanitizeArray(result.interview_questions || [])
    const sanitizedPotentialConcerns = sanitizeArray(result.potential_concerns || [])

    return {
      ...result,
      technical_skills: sanitizedTechnicalSkills,
      key_highlights: sanitizedKeyHighlights,
      standout_projects: sanitizedStandoutProjects,
      interview_questions: sanitizedInterviewQuestions,
      potential_concerns: sanitizedPotentialConcerns
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
      {/* Tylko przycisk odświeżania, jeśli analiza już istnieje */}
      {result && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Analiza CV</h3>
          <Button size="sm" variant="outline" onClick={() => run(true)} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Ponów analizę
          </Button>
        </div>
      )}
      
      {/* Stan ładowania dla pierwszego wywołania */}
      {loading && !result && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-muted-foreground py-8">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Analizuję CV...</span>
            </div>
          </CardContent>
        </Card>
      )}
      
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => run(false)} className="mt-3">
              <RefreshCw className="h-4 w-4 mr-2" />
              Spróbuj ponownie
            </Button>
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
                        <li key={i}>{String(highlight || `Highlight ${i + 1}`)}</li>
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
                      // Ensure skill is always a string
                      const skillText = String(skill || `Skill ${index + 1}`).trim()
                      
                      return (
                        <Badge key={`skill-${index}`} variant="secondary" className="text-xs">
                          {skillText}
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
                    <li key={i}>{String(project || `Project ${i + 1}`)}</li>
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
                      <span className="text-sm text-blue-900">{String(question || `Question ${i + 1}`)}</span>
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
                    <li key={i} className="text-amber-900">{String(concern || `Concern ${i + 1}`)}</li>
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