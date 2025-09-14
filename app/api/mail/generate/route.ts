import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { smartChatPlain } from '@/lib/ai'

interface GenerateRequest {
  candidate: {
    name: string
    position: string
    score?: number
    strengths?: string[]
    weaknesses?: string[]
    recommendation?: 'hire' | 'maybe' | 'reject'
  }
  tone?: 'positive' | 'neutral' | 'negative'
  language?: 'pl' | 'en'
  recruiterInstructions?: string
  temperature?: number
}

function buildPrompt(data: GenerateRequest): string {
  const lang = data.language || 'pl'
  const { candidate, tone, recruiterInstructions } = data
  const strengths = (candidate.strengths || []).slice(0, 8).join('\\n- ')
  const weaknesses = (candidate.weaknesses || []).slice(0, 8).join('\\n- ')
  const base = lang === 'pl'
    ? `Jesteś asystentem HR piszącym profesjonalne maile rekrutacyjne w języku polskim.\nZadanie: wygeneruj treść maila z feedbackiem dla kandydata.\nWymagania stylistyczne:\n- Zwięźle, empatycznie, profesjonalnie.\n- Unikaj przesadnego marketingu.\n- Używaj drugiej osoby ("Twoje", "Ciebie").\n- Dodaj akapity oddzielone pustą linią.\nFormat końcowy: CZYSTY TEKST (bez markdown, bez gwiazdek). Nie dodawaj nagłówków typu "Feedback".\n\nDane kandydata:\nImię i nazwisko: ${candidate.name}\nStanowisko: ${candidate.position}\nOcena (0-100): ${candidate.score ?? 'brak'}\nRekomendacja systemu: ${candidate.recommendation || 'brak'}\nMocne strony:\n- ${strengths || 'brak danych'}\nObszary do rozwoju:\n- ${weaknesses || 'brak danych'}\n\nTon wiadomości (priorytet): ${tone || 'neutralny'}\nDodatkowe instrukcje rekrutera: ${recruiterInstructions || 'brak'}\n\nZasady specyficzne dla tonu:\n- positive: podkreśl dopasowanie i zaproś na rozmowę.\n- neutral: poproś o doprecyzowanie brakujących informacji lub wskaż następne kroki.\n- negative: podziękuj, kulturalnie odmów, dodaj konstruktywną radę.\n\nWygeneruj tylko treść maila (bez tematu).`
    : `You are an HR assistant generating professional recruitment feedback emails in English.\nTask: Generate feedback email body only (no subject line).\nStyle: concise, empathetic, professional. Second person.\n\nCandidate:\nName: ${candidate.name}\nRole: ${candidate.position}\nScore: ${candidate.score ?? 'n/a'}\nRecommendation: ${candidate.recommendation || 'n/a'}\nStrengths:\n- ${strengths || 'n/a'}\nWeaknesses:\n- ${weaknesses || 'n/a'}\nTone: ${tone || 'neutral'}\nExtra recruiter instructions: ${recruiterInstructions || 'none'}\nReturn plain text.`
  return base
}

async function callOllamaRaw(prompt: string, temperature = 0.2) {
  const host = process.env.OLLAMA_HOST || 'http://localhost:11434'
  const model = process.env.OLLAMA_MODEL || 'llama3.1'
  const res = await fetch(`${host}/api/generate`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model, prompt, stream: false, options: { temperature } })
  })
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`)
  const data = await res.json(); return data.response as string
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = (await req.json()) as GenerateRequest
    if (!body?.candidate?.name || !body?.candidate?.position) {
      return NextResponse.json({ error: 'Brak wymaganych danych kandydata' }, { status: 400 })
    }
    const temperature = typeof body.temperature === 'number' ? Math.max(0, Math.min(1, body.temperature)) : 0.2
    const prompt = buildPrompt(body)
    let content: string | null = null
    // First try multi-provider chain
    try {
      content = await smartChatPlain('You generate professional recruitment feedback emails. Output only the email body.', prompt, { temperature })
    } catch (chainErr) {
      console.warn('smartChatPlain chain failed, trying direct Ollama', chainErr)
      try {
        content = await callOllamaRaw(prompt, temperature)
      } catch (ollamaErr) {
        console.error('All providers failed', ollamaErr)
        return NextResponse.json({ error: 'AI generation unavailable' }, { status: 503 })
      }
    }
    content = (content || '').trim().replace(/[*_`#>]/g, '')
    return NextResponse.json({ success: true, content })
  } catch (err: any) {
    console.error('AI email generate error', err)
    return NextResponse.json({ error: 'Internal error', details: err.message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}