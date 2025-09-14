"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles } from "lucide-react"

type Result = {
  summary?: string
  key_skills?: string[]
  total_experience_years?: number
  seniority?: string
  top_roles?: string[]
  education?: string[]
  languages?: string[]
  notable_projects?: string[]
  risks?: string[]
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

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => run(false)} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Analiza CV (AI)
        </Button>
        <Button size="sm" variant="outline" onClick={() => run(true)} disabled={loading}>Odśwież</Button>
      </div>
      {error && <div className="text-sm text-destructive">{error}</div>}
      {result && (
        <div className="space-y-3">
          {result.summary && (
            <p className="text-sm leading-6">{result.summary}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.key_skills && result.key_skills.length > 0 && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Kluczowe umiejętności</div>
                <div className="flex flex-wrap gap-1.5">
                  {result.key_skills.map(s => <Badge key={s} variant="outline">{s}</Badge>)}
                </div>
              </div>
            )}
            {typeof result.total_experience_years === 'number' && (
              <div className="text-sm"><span className="text-muted-foreground">Doświadczenie:</span> ~{result.total_experience_years} lata</div>
            )}
            {result.seniority && (
              <div className="text-sm"><span className="text-muted-foreground">Poziom:</span> {result.seniority}</div>
            )}
            {result.top_roles && result.top_roles.length > 0 && (
              <div className="text-sm"><span className="text-muted-foreground">Role:</span> {result.top_roles.join(', ')}</div>
            )}
            {result.languages && result.languages.length > 0 && (
              <div className="text-sm"><span className="text-muted-foreground">Języki:</span> {result.languages.join(', ')}</div>
            )}
            {result.education && result.education.length > 0 && (
              <div className="text-sm"><span className="text-muted-foreground">Edukacja:</span> {result.education.join('; ')}</div>
            )}
          </div>
          {result.notable_projects && result.notable_projects.length > 0 && (
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Projekty</div>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {result.notable_projects.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}
          {result.risks && result.risks.length > 0 && (
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Ryzyka / uwagi</div>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {result.risks.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}