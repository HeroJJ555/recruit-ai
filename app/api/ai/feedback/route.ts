import { NextRequest, NextResponse } from "next/server";

interface Candidate {
  name: string;
  position: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: 'hire' | 'maybe' | 'reject';
}

interface FeedbackRequest {
  candidate: Candidate;
}

export async function POST(req: NextRequest) {
  try {
    console.log("🤖 AI Feedback API: Received request");
    const body = await req.json() as FeedbackRequest;
    
    const { candidate } = body;

    if (!candidate || !candidate.name || !candidate.position) {
      console.log("❌ AI Feedback API: Missing candidate data");
      return NextResponse.json(
        { error: "Brak danych kandydata" },
        { status: 400 }
      );
    }

    console.log(`📝 AI Feedback API: Generating feedback for ${candidate.name}, score: ${candidate.score}`);

    // Generate intelligent feedback based on candidate data
    const feedback = generatePersonalizedFeedback(candidate);
    
    console.log("✅ AI Feedback generated");
    
    return NextResponse.json({ 
      feedback,
      candidate: candidate.name,
      score: candidate.score,
      recommendation: candidate.recommendation
    });

  } catch (error) {
    console.error("💥 AI Feedback API Error:", error);
    
    return NextResponse.json(
      { 
        error: "Wystąpił błąd podczas generowania feedbacku. Spróbuj ponownie za chwilę."
      },
      { status: 500 }
    );
  }
}

function generatePersonalizedFeedback(candidate: Candidate): string {
  const { name, position, score, strengths, weaknesses, recommendation } = candidate;
  
  // Positive feedback for strong candidates
  if (recommendation === 'hire' && score >= 80) {
    return `Szanowny/a ${name},

Dziękujemy za aplikację na stanowisko ${position}. Po szczegółowej analizie Twojego CV jesteśmy bardzo pozytywnie zaskoczeni Twoimi kwalifikacjami!

🎯 **Twoje mocne strony, które nas przekonały:**
${strengths.map(s => `• ${s}`).join('\n')}

Twój profil idealnie wpisuje się w nasze oczekiwania. Osiągnąłeś/aś ${score} punktów na 100 możliwych w naszej analizie, co plasuje Cię w gronie najlepszych kandydatów.

**Następne kroki:**
Chcielibyśmy zaprosić Cię na rozmowę kwalifikacyjną. Nasz zespół HR skontaktuje się z Tobą w ciągu najbliższych 2-3 dni roboczych w celu ustalenia terminu.

Na rozmowie omówimy szczegóły stanowiska, Twoje oczekiwania oraz odpowiemy na wszystkie pytania dotyczące naszej firmy i kultury pracy.

Gratulujemy świetnego CV i czekamy na spotkanie!

Pozdrawiamy,
Zespół Rekrutacji`;
  }
  
  // Moderate positive feedback
  if (recommendation === 'hire' && score >= 70) {
    return `Szanowny/a ${name},

Dziękujemy za zainteresowanie stanowiskiem ${position}. Twoje CV zostało pozytywnie ocenione przez nasz zespół.

✅ **Elementy, które wyróżniają Twoją kandydaturę:**
${strengths.map(s => `• ${s}`).join('\n')}

${weaknesses.length > 0 ? `⚠️ **Obszary, które chcielibyśmy omówić:**
${weaknesses.map(w => `• ${w}`).join('\n')}

` : ''}Osiągnąłeś/aś ${score} punktów w naszej analizie CV, co kwalifikuje Cię do dalszego procesu rekrutacyjnego.

**Kolejny krok:**
Zapraszamy Cię na rozmowę kwalifikacyjną, podczas której będziemy mogli lepiej poznać Twoje doświadczenie i omówić wzajemne oczekiwania.

Skontaktujemy się z Tobą w ciągu tygodnia w celu ustalenia terminu.

Pozdrawiamy,
Zespół Rekrutacji`;
  }
  
  // Uncertain/maybe feedback
  if (recommendation === 'maybe') {
    return `Szanowny/a ${name},

Dziękujemy za aplikację na stanowisko ${position}. Po analizie Twojego CV chcielibyśmy podzielić się naszymi obserwacjami.

👍 **Pozytywne elementy Twojego profilu:**
${strengths.map(s => `• ${s}`).join('\n')}

🔍 **Obszary wymagające wyjaśnienia:**
${weaknesses.map(w => `• ${w}`).join('\n')}

Twoje CV otrzymało ${score} punktów na 100 możliwych. Widzimy potencjał w Twojej kandydaturze, jednak potrzebujemy dodatkowych informacji.

**Co dalej:**
Prosimy o przesłanie dodatkowych informacji lub dokumentów, które mogłyby wzmocnić Twoją aplikację. Alternatywnie, zapraszamy na krótką rozmowę telefoniczną (15-20 min), podczas której omówimy Twoje doświadczenie.

Jeśli jesteś zainteresowany/a, odpowiedz na tego maila, a skontaktujemy się z Tobą w ciągu kilku dni.

Pozdrawiamy,
Zespół Rekrutacji`;
  }
  
  // Negative but constructive feedback
  if (recommendation === 'reject' && score >= 40) {
    return `Szanowny/a ${name},

Dziękujemy za zainteresowanie stanowiskiem ${position} i przesłanie swojego CV.

Po dokładnej analizie Twojej aplikacji musieliśmy podjąć trudną decyzję o nieprzejściu do kolejnego etapu rekrutacji na to konkretne stanowisko.

${strengths.length > 0 ? `💡 **Pozytywne elementy Twojego profilu:**
${strengths.map(s => `• ${s}`).join('\n')}

` : ''}**Obszary, które zadecydowały o naszej decyzji:**
${weaknesses.map(w => `• ${w}`).join('\n')}

**Nasze rekomendacje:**
Twój profil ma potencjał, ale wymaga rozwoju w kluczowych obszarach. Sugerujemy:
• Zdobycie dodatkowego doświadczenia w wymaganych technologiach
• Uzupełnienie braków w wykształceniu lub certyfikatach
• Pracę nad projektami, które wzmocnią Twoje portfolio

Zachęcamy do śledzenia naszych przyszłych ofert pracy. Gdy nabierzesz więcej doświadczenia, chętnie ponownie rozpatrzymy Twoją kandydaturę.

Życzymy powodzenia w poszukiwaniu idealnej pozycji!

Pozdrawiamy,
Zespół Rekrutacji`;
  }
  
  // Strong negative feedback
  return `Szanowny/a ${name},

Dziękujemy za aplikację na stanowisko ${position}.

Po szczegółowej analizie Twojego CV musieliśmy podjąć decyzję o nieprzejściu do kolejnego etapu rekrutacji. Twój profil nie odpowiada w wystarczającym stopniu wymaganiom tego stanowiska.

${strengths.length > 0 ? `Doceniamy następujące elementy Twojego CV:
${strengths.map(s => `• ${s}`).join('\n')}

` : ''}Aby zwiększyć swoje szanse w przyszłych aplikacjach, zalecamy:
• Zdobycie większego doświadczenia w branży
• Rozwój umiejętności technicznych wymaganych na podobnych stanowiskach
• Uzupełnienie wykształcenia lub zdobycie certyfikatów

Życzymy powodzenia w dalszych poszukiwaniach i rozwoju zawodowym.

Pozdrawiamy,
Zespół Rekrutacji`;
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