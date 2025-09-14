import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

type ChatRequest = {
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
}

async function getDatabaseContext(): Promise<string> {
  try {
    // Pobierz aktualną statystykę - używamy uproszczonej wersji
    const [candidatesCount, jobsCount] = await Promise.all([
      // Policz kandydatów
      (prisma as any).candidateApplication.count(),
      
      // Policz aktywne oferty
      (prisma as any).job.count({
        where: { status: 'OPEN' }
      })
    ])

    // Przygotuj kontekst
    let context = "=== AKTUALNY KONTEKST Z BAZY DANYCH ===\n"
    
    context += `\nOGÓLNE STATYSTYKI:\n`
    context += `- Łączna liczba kandydatów: ${candidatesCount}\n`
    context += `- Aktywne oferty pracy: ${jobsCount}\n`

    // Dodaj informacje o obecnym systemie
    context += `\nFUNKCJONALNOŚCI SYSTEMU:\n`
    context += `- Analiza CV z AI (kompatybilność, umiejętności, podsumowanie)\n`
    context += `- Zarządzanie ofertami pracy\n`
    context += `- Ocena kandydatów z wynikami procentowymi\n`
    context += `- System aplikacji i rekrutacji\n`

    context += "\n=== KONIEC KONTEKSTU ===\n"
    return context
    
  } catch (error) {
    console.error('Error fetching database context:', error)
    return "=== BRAK DOSTĘPU DO BAZY DANYCH ===\nSystem posiada funkcjonalności analizy CV, zarządzania ofertami pracy i oceny kandydatów.\n"
  }
}

async function callOpenAI(messages: ChatMessage[], temperature = 0.7, maxTokens = 1000): Promise<string> {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY nie jest skonfigurowany')
    }

    console.log('=== Calling OpenAI API ===')
    console.log('Messages count:', messages.length)
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`OpenAI API error ${response.status}: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''
    
    console.log('OpenAI response length:', content.length)
    
    if (!content || content.length < 2) {
      return "Jestem asystentem rekrutacyjnym. W czym mogę pomóc?"
    }
    
    return content.trim()
    
  } catch (error) {
    console.error('OpenAI API failed:', error)
    throw error
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: ChatRequest = await req.json()
    
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 })
    }

    const temperature = Math.max(0, Math.min(1, body.temperature || 0.7))
    const maxTokens = Math.max(50, Math.min(2048, body.maxTokens || 1000))

    console.log('Chat request:', { 
      messageCount: body.messages.length, 
      temperature, 
      maxTokens,
      userEmail: session.user?.email 
    })

    // Pobierz kontekst z bazy danych
    const dbContext = await getDatabaseContext()
    
    // Przygotuj wiadomości z kontekstem systemowym
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `Jesteś profesjonalnym asystentem AI specjalizującym się w rekrutacji i HR. Odpowiadaj po polsku, zwięźle i konkretnie. 

WAŻNE ZASADY PISANIA:
- NIE używaj markdown'u (bez **, ##, ###, - itp.)
- Pisz prostym tekstem jak SMS - ciągłym tekstem bez formatowania
- Możesz używać prostych znaków interpunkcyjnych (. , ! ?)
- Odpowiadaj naturalnie, jak w rozmowie

Masz dostęp do aktualnych danych z systemu rekrutacyjnego:
${dbContext}

Udzielaj praktycznych porad dotyczących procesu rekrutacji, oceny kandydatów, tworzenia opisów stanowisk i prowadzenia rozmów kwalifikacyjnych. 
Kiedy to możliwe, odnosź się do konkretnych danych z bazy (kandydaci, oferty pracy, analizy CV).

Jeśli użytkownik pyta o statystyki, kandydatów lub oferty - wykorzystaj powyższe dane.`
    }

    // Dodaj system message na początku jeśli go nie ma
    const messagesWithSystem = body.messages[0]?.role === 'system' 
      ? [systemMessage, ...body.messages.slice(1)]
      : [systemMessage, ...body.messages]

    const answer = await callOpenAI(messagesWithSystem, temperature, maxTokens)

    return NextResponse.json({ 
      answer,
      model: "gpt-4o-mini",
      temperature,
      maxTokens
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    const fallbackResponse = "Cześć! Jestem asystentem AI ds. rekrutacji. Mogę pomóc z pisaniem opisów stanowisk, przygotowaniem pytań na rozmowy kwalifikacyjne lub oceną kandydatów. Napisz, w czym mogę pomóc!"
    
    return NextResponse.json({ 
      answer: fallbackResponse,
      model: "fallback",
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}