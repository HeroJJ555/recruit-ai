import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
  const { message, messages, temperature } = body

    // Support both single message and messages array
    const lastMessage = message || (messages && messages.length > 0 ? messages[messages.length - 1]?.content : null)

    if (!lastMessage) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const databaseContext = await getDatabaseContext()
    
  const completion = await callOpenAI(lastMessage, databaseContext, openaiApiKey, typeof temperature === 'number' ? temperature : undefined)
    
    return NextResponse.json({ answer: completion, response: completion })
  } catch (error) {
    console.error("AI chat error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function getDatabaseContext() {
  try {
    const candidateApplications = await (prisma as any).candidateApplication.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        cvAnalysis: true,
        job: true
      }
    })

    const jobs = await (prisma as any).job.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })

    return {
      recentApplications: candidateApplications.length,
      availableJobs: jobs.length,
      candidateData: candidateApplications.slice(0, 3).map((app: any) => ({
        name: app.candidateName,
        job: app.job?.title,
        score: app.compatibilityScore,
        status: app.status
      }))
    }
  } catch (error) {
    console.error("Database context error:", error)
    return { recentApplications: 0, availableJobs: 0, candidateData: [] }
  }
}

async function callOpenAI(message: string, context: any, apiKey: string, temperatureOverride?: number) {
  const systemPrompt = `Jesteś asystentem AI dla rekrutera w polskiej firmie technologicznej. 
Aktualne dane z bazy:
- Ostatnie aplikacje: ${context.recentApplications}
- Dostępne stanowiska: ${context.availableJobs}
- Najnowsi kandydaci: ${JSON.stringify(context.candidateData)}

Odpowiadaj po polsku, pomagaj w rekrutacji i analizie kandydatów.`

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
  temperature: typeof temperatureOverride === 'number' ? Math.max(0, Math.min(1, temperatureOverride)) : 0.7,
      max_tokens: 1000
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || "Przepraszam, nie mogę teraz odpowiedzieć."
}
