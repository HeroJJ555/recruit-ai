import { NextRequest, NextResponse } from "next/server"

// Chosen lightweight free model (good size-quality tradeoff)
const DEFAULT_MODEL = "microsoft/Phi-3.5-mini-instruct"

interface ChatMessage { role: "user" | "assistant" | "system"; content: string }

function buildPrompt(messages: ChatMessage[]) {
  const system = messages.find(m => m.role === "system")?.content || "Jesteś pomocnym asystentem rekrutacyjnym. Odpowiadaj zwięźle po polsku."
  const convo = messages
    .filter(m => m.role !== "system")
    .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n")
  return `${system}\n\n${convo}\nAssistant:`
}

export const runtime = "edge" // szybszy cold start jeśli dostępne

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || !Array.isArray(body.messages)) {
      return NextResponse.json({ error: "Invalid body. Expected { messages: ChatMessage[] }" }, { status: 400 })
    }

    const messages = body.messages as ChatMessage[]
    const model = (body.model as string) || DEFAULT_MODEL
    const token = process.env.HUGGINGFACE_API_TOKEN

    // Safety limits
    if (messages.length > 40) {
      return NextResponse.json({ error: "Za długa historia rozmowy (max 40)." }, { status: 400 })
    }

    const prompt = buildPrompt(messages)
    if (prompt.length > 12000) {
      return NextResponse.json({ error: "Zbyt długi prompt (limit ~12k znaków)." }, { status: 400 })
    }

    // Fallback if no token configured
    if (!token) {
      return NextResponse.json({
        answer:
          "(TRYB DEMO) Skonfiguruj HUGGINGFACE_API_TOKEN w .env aby uzyskać prawdziwe odpowiedzi. Odpowiedź przykładowa: Zbieraj kluczowe wymagania stanowiska i oceniaj kandydatów względem nich.",
        model,
        demo: true,
      })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000)
    let hfRes: Response
    try {
      hfRes = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 420,
            temperature: 0.7,
            top_p: 0.9,
            repetition_penalty: 1.1,
            return_full_text: false,
          },
        }),
        signal: controller.signal,
      })
    } catch (e: any) {
      clearTimeout(timeout)
      if (e.name === "AbortError") {
        return NextResponse.json({ error: "Przekroczono limit czasu (timeout)." }, { status: 504 })
      }
      return NextResponse.json({ error: "Błąd sieci podczas wywołania modelu." }, { status: 502 })
    }
    clearTimeout(timeout)

    if (!hfRes.ok) {
      const text = await hfRes.text().catch(() => "")
      const status = hfRes.status
      // typowe 503 cold start / 429 rate limit
      if (status === 503) {
        return NextResponse.json({ error: "Model cold start lub niedostępny (503). Spróbuj ponownie za chwilę." }, { status })
      }
      if (status === 429) {
        return NextResponse.json({ error: "Limit zapytań osiągnięty (429). Ogranicz częstotliwość." }, { status })
      }
      return NextResponse.json({ error: `Błąd modelu (${status}).`, details: text.slice(0, 500) }, { status })
    }

    const data = await hfRes.json().catch(() => null)
    // Zależnie od modelu HF może zwrócić tablicę obiektów { generated_text }
    let answer = ""
    if (Array.isArray(data) && data[0]?.generated_text) {
      answer = data[0].generated_text.trim()
    } else if (data?.generated_text) {
      answer = String(data.generated_text).trim()
    } else {
      answer = "(Brak treści w odpowiedzi modelu)"
    }
    // Sanitization
    if (answer.length > 5000) answer = answer.slice(0, 5000) + "..."

    return NextResponse.json({ answer, model })
  } catch (e: any) {
    return NextResponse.json({ error: "Nieoczekiwany błąd serwera." }, { status: 500 })
  }
}
