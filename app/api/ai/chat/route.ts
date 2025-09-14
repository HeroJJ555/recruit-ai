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

async function callGradioChat(messages: ChatMessage[], temperature = 0.7, maxTokens = 512): Promise<string> {
  try {
    console.log('Connecting to Gradio: NotASI/Llama-3.1-Storm-8B')
    const client = await Client.connect("NotASI/Llama-3.1-Storm-8B")
    
    // Extract system prompt and latest user message
    const systemMessage = messages.find(m => m.role === 'system')?.content || 
      "Jesteś pomocnym asystentem AI specjalizującym się w rekrutacji. Odpowiadaj w języku polskim, zwięźle i konkretnie."
    
    const userMessages = messages.filter(m => m.role === 'user')
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || "Cześć!"
    
    // Build conversation context if there are previous messages
    let conversationContext = ""
    if (messages.length > 2) {
      const recentMessages = messages.slice(-6) // Last 6 messages for context
      conversationContext = recentMessages
        .map(m => `${m.role}: ${m.content}`)
        .join('\n') + '\n\n'
    }
    
    const fullMessage = conversationContext + lastUserMessage
    
    console.log('Sending to Gradio:', { 
      messageLength: fullMessage.length, 
      systemLength: systemMessage.length,
      temperature,
      maxTokens 
    })
    
    const result = await client.predict("/chat", {
      message: fullMessage,
      system_prompt: systemMessage,
      temperature: temperature,
      max_new_tokens: maxTokens,
      top_p: 0.9,
      top_k: 50,
      penalty: 0.1,
    })
    
    console.log('Gradio response received:', { 
      dataType: typeof result?.data,
      hasData: !!result?.data 
    })
    
    // Extract response from Gradio result
    let response = ""
    if (result?.data && Array.isArray(result.data)) {
      // Gradio typically returns an array, get the first string element
      response = result.data.find(item => typeof item === 'string') || ""
    } else if (typeof result?.data === 'string') {
      response = result.data
    }
    
    if (!response) {
      throw new Error('Empty response from Gradio')
    }
    
    return response.trim()
    
  } catch (error) {
    console.error('Gradio chat error:', error)
    throw new Error(`Gradio API failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: ChatRequest = await req.json()
    
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 })
    }

    const temperature = Math.max(0, Math.min(1, body.temperature || 0.7))
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
    
    // Fallback response for when Gradio is unavailable
    const fallbackResponse = "Przepraszam, asystent AI jest obecnie niedostępny. Spróbuj ponownie za chwilę lub skontaktuj się z administratorem systemu."
    
    return NextResponse.json({ 
      answer: fallbackResponse,
      error: "AI service temporarily unavailable",
      model: "fallback"
    }, { status: 503 })
  }
}