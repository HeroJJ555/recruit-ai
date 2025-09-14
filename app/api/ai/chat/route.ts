import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Client } from "@gradio/client"

type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

type ChatRequest = {
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
}

async function callGradioChat(messages: ChatMessage[], temperature = 0.4, maxTokens = 512): Promise<string> {
  try {
    console.log('=== Connecting to Gradio: NotASI/Llama-3.1-Storm-8B ===')
    
    const client = await Client.connect("NotASI/Llama-3.1-Storm-8B")
    
    const userMessages = messages.filter(m => m.role === 'user')
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || "Cześć!"
    
    console.log('User message:', lastUserMessage)
    
    // System prompt in Polish for recruitment context
    const systemPrompt = "Jesteś profesjonalnym asystentem AI specjalizującym się w rekrutacji i HR. Odpowiadaj po polsku, zwięźle i konkretnie. Udzielaj praktycznych porad dotyczących procesu rekrutacji, oceny kandydatów, tworzenia opisów stanowisk i prowadzenia rozmów kwalifikacyjnych."
    
    const result = await client.predict("/chat", {
      message: lastUserMessage,
      system_prompt: systemPrompt,
      temperature: temperature,
      max_new_tokens: maxTokens,
      top_p: 0.9,
      top_k: 40,
      penalty: 1.1,
    })
    
    console.log('Gradio response:', result.data)
    
    let response = ""
    if (result?.data) {
      if (Array.isArray(result.data)) {
        response = result.data.find(item => typeof item === 'string') || result.data[0] || ""
      } else if (typeof result.data === 'string') {
        response = result.data
      } else {
        response = String(result.data)
      }
    }
    
    if (!response || response.length < 2) {
      return "Jestem asystentem rekrutacyjnym. W czym mogę pomóc?"
    }
    
    return response.trim()
    
  } catch (error) {
    console.error('Gradio connection failed:', error)
    return "Cześć! Jestem asystentem AI ds. rekrutacji. Mogę pomóc z pisaniem opisów stanowisk, przygotowaniem pytań na rozmowy kwalifikacyjne lub oceną kandydatów. W czym mogę pomóc?"
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

    const temperature = Math.max(0, Math.min(1, body.temperature || 0.4))
    const maxTokens = Math.max(50, Math.min(2048, body.maxTokens || 512))

    console.log('Chat request:', { 
      messageCount: body.messages.length, 
      temperature, 
      maxTokens,
      userEmail: session.user?.email 
    })

    const answer = await callGradioChat(body.messages, temperature, maxTokens)

    return NextResponse.json({ 
      answer,
      model: "NotASI/Llama-3.1-Storm-8B",
      temperature,
      maxTokens
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    const fallbackResponse = "Cześć! Jestem asystentem AI ds. rekrutacji. Mogę pomóc z pisaniem opisów stanowisk, przygotowaniem pytań na rozmowy kwalifikacyjne lub oceną kandydatów. Napisz, w czym mogę pomóc!"
    
    return NextResponse.json({ 
      answer: fallbackResponse,
      model: "fallback"
    })
  }
}