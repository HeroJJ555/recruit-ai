import { NextRequest, NextResponse } from "next/server";
import { Client } from "@gradio/client";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const HR_SYSTEM_PROMPT = `Jesteś doświadczonym asystentem AI specjalizującym się w rekrutacji i HR. Twoim zadaniem jest wspieranie rekruterów w ich codziennej pracy. Możesz pomóc w:

🎯 REKRUTACJA I SELEKCJA:
- Analizie CV i profili kandydatów
- Ocenie dopasowania kandydatów do stanowisk
- Przygotowaniu pytań na rozmowy kwalifikacyjne
- Strategiach dotarcia do talentów

📋 ZARZĄDZANIE PROCESAMI:
- Optymalizacji procesów rekrutacyjnych
- Tworzeniu opisów stanowisk
- Planowaniu struktur organizacyjnych
- Metrykach i KPI w HR

🤝 ROZWÓJ PRACOWNIKÓW:
- Planach rozwoju kariery
- Strategiach retencji talentów
- Programach szkoleń i rozwoju
- Zarządzaniu performansem

💼 EMPLOYER BRANDING:
- Budowaniu marki pracodawcy
- Strategiach komunikacji z kandydatami
- Poprawie candidate experience

Odpowiadaj konkretnie, profesjonalnie i zawsze odnosząc się do praktycznych aspektów pracy w HR. Udzielaj szczegółowych, actionable porad opartych na najlepszych praktykach branżowych.`;

export async function POST(req: NextRequest) {
  try {
    console.log("🤖 AI Chat API: Received request");
    const body = await req.json();
    
    if (!body.messages || !Array.isArray(body.messages)) {
      console.log("❌ AI Chat API: Invalid message format");
      return NextResponse.json(
        { error: "Nieprawidłowy format wiadomości" },
        { status: 400 }
      );
    }

    // Build conversation context
    const messages = body.messages as ChatMessage[];
    const conversationHistory = messages
      .slice(-10) // Last 10 messages for context
      .map(msg => `${msg.role === "user" ? "Użytkownik" : "Asystent"}: ${msg.content}`)
      .join("\n\n");
    
    const lastUserMessage = messages.filter(m => m.role === "user").pop()?.content || "";
    
    if (!lastUserMessage) {
      console.log("❌ AI Chat API: No user message found");
      return NextResponse.json(
        { error: "Brak wiadomości użytkownika" },
        { status: 400 }
      );
    }

    console.log("📝 AI Chat API: User message:", lastUserMessage);

    try {
      console.log("🚀 Connecting to Llama-3.1-Storm-8B model...");
      
      // Connect to the Gradio AI model
      const client = await Client.connect("NotASI/Llama-3.1-Storm-8B");
      
      // Prepare the prompt with system context and conversation history
      const fullPrompt = `${HR_SYSTEM_PROMPT}

=== KONTEKST ROZMOWY ===
${conversationHistory}

=== NOWE PYTANIE ===
Użytkownik: ${lastUserMessage}

=== ODPOWIEDŹ ===
Asystent:`;

      console.log("🧠 Sending prompt to AI model...");
      
      // Call the AI model with specific parameters
      const result = await client.predict("/chat", {
        message: fullPrompt,
        system_message: HR_SYSTEM_PROMPT,
        max_new_tokens: 2048,
        temperature: 0.7,
        top_p: 0.95,
        top_k: 40,
        repetition_penalty: 1.1
      });

      console.log("✅ AI model response received");
      
      // Extract the response - handle different response formats
      let aiResponse = "Przepraszam, wystąpił problem z generowaniem odpowiedzi.";
      
      if (result && typeof result === 'object' && 'data' in result) {
        const data = result.data as any[];
        if (Array.isArray(data) && data.length > 0) {
          aiResponse = data[1] || data[0] || aiResponse;
        }
      }
      
      return NextResponse.json({ 
        answer: aiResponse,
        model: "Llama-3.1-Storm-8B",
        provider: "NotASI" 
      });
      
    } catch (aiError) {
      console.error("� AI Model Error:", aiError);
      
      // Fallback response when AI is unavailable
      const fallbackResponse = `Przepraszam, aktualnie mam problemy z połączeniem do głównego modelu AI. 

Jestem asystentem HR i mogę pomóc w podstawowych kwestiach:

🔍 **Jeśli pytasz o analizę CV:**
Sprawdź doświadczenie zawodowe, umiejętności techniczne, ścieżkę kariery i osiągnięcia kandydata.

� **Jeśli potrzebujesz pytań na rozmowę:**
Przygotuj pytania techniczne, behawioralne i motywacyjne dostosowane do stanowiska.

📋 **Jeśli tworzysz opis stanowiska:**
Uwzględnij jasny tytuł, wymagania, obowiązki i benefity.

Spróbuj ponownie za chwilę - główny model AI powinien zostać przywrócony.`;

      return NextResponse.json({ 
        answer: fallbackResponse,
        model: "fallback",
        error: "AI model temporarily unavailable"
      });
    }

  } catch (error) {
    console.error("💥 AI Chat API Error:", error);
    
    return NextResponse.json(
      { 
        error: "Wystąpił błąd podczas komunikacji z asystentem AI. Spróbuj ponownie za chwilę.",
        model: "error"
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
