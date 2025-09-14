<<<<<<< HEAD
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
=======
﻿import { NextRequest, NextResponse } from "next/server";import { NextRequest, NextResponse } from "next/server";
>>>>>>> 4d0541d36d9d9313bb5f30da37ae7872b55eab3c



<<<<<<< HEAD
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
=======
interface ChatMessage {interface ChatMessage {

  role: "user" | "assistant";  role: "user" | "assistant";

  content: string;  content: string;

}}



function generateIntelligentHRResponse(userMessage: string, conversationHistory: string): string {function generateIntelligentHRResponse(userMessage: string, conversationHistory: string): string {

  const message = userMessage.toLowerCase();  const message = userMessage.toLowerCase();

    

  // Analiza intencji użytkownika na podstawie słów kluczowych  // Analiza intencji użytkownika na podstawie słów kluczowych

  const keywords = {  const keywords = {

    cvAnalysis: ['cv', 'kandydat', 'analiz', 'profil', 'życiorys', 'doświadczenie', 'kompetencj', 'umiejętnoś'],    cvAnalysis: ['cv', 'kandydat', 'analiz', 'profil', 'życiorys', 'doświadczenie', 'kompetencj', 'umiejętnoś'],

    interview: ['rozmow', 'pytani', 'interview', 'kandydat', 'rekrutacj', 'sprawdz', 'test'],    interview: ['rozmow', 'pytani', 'interview', 'kandydat', 'rekrutacj', 'sprawdz', 'test'],

    jobDescription: ['opis', 'stanowisk', 'ofert', 'praca', 'pozycj', 'wymagan', 'obowiązk'],    jobDescription: ['opis', 'stanowisk', 'ofert', 'praca', 'pozycj', 'wymagan', 'obowiązk'],

    process: ['proces', 'rekrutacj', 'optymalizacj', 'czas', 'efektywn', 'usprawni'],    process: ['proces', 'rekrutacj', 'optymalizacj', 'czas', 'efektywn', 'usprawni'],

    teamFit: ['zespół', 'pasuj', 'dopasowa', 'kultura', 'współprac', 'team', 'fit'],    teamFit: ['zespół', 'pasuj', 'dopasowa', 'kultura', 'współprac', 'team', 'fit'],

    skills: ['umiejętnoś', 'kompetencj', 'technicz', 'skill', 'wiedz', 'znajomość'],    skills: ['umiejętnoś', 'kompetencj', 'technicz', 'skill', 'wiedz', 'znajomość'],

    salary: ['wynagrodzeni', 'pensj', 'płac', 'salary', 'stawka', 'zarobk'],    salary: ['wynagrodzeni', 'pensj', 'płac', 'salary', 'stawka', 'zarobk'],

    onboarding: ['wdrożeni', 'onboarding', 'adaptacj', 'wprowadzeni', 'pierwsz'],    onboarding: ['wdrożeni', 'onboarding', 'adaptacj', 'wprowadzeni', 'pierwsz'],

    retention: ['zatrzyma', 'retention', 'motywacj', 'satysfakcj', 'loyalnoś']    retention: ['zatrzyma', 'retention', 'motywacj', 'satysfakcj', 'loyalnoś']

  };  };



  // Sprawdzenie, która kategoria najlepiej pasuje  // Sprawdzenie, która kategoria najlepiej pasuje

  let bestMatch = '';  let bestMatch = '';

  let maxMatches = 0;  let maxMatches = 0;

    

  for (const [category, words] of Object.entries(keywords)) {  for (const [category, words] of Object.entries(keywords)) {

    const matches = words.filter(word => message.includes(word)).length;    const matches = words.filter(word => message.includes(word)).length;

    if (matches > maxMatches) {    if (matches > maxMatches) {

      maxMatches = matches;      maxMatches = matches;

      bestMatch = category;      bestMatch = category;

    }    }

  }  }



  // Generowanie odpowiedzi na podstawie kategorii  // Generowanie odpowiedzi na podstawie kategorii

  switch (bestMatch) {  switch (bestMatch) {

    case 'cvAnalysis':    case 'cvAnalysis':

      return `🔍 **Analiza CV/profilu kandydata:**      return `🔍 **Analiza CV/profilu kandydata:**



**Kluczowe elementy do oceny:****Kluczowe elementy do oceny:**

• **Doświadczenie zawodowe** - Czy pasuje do wymagań stanowiska? Sprawdź progresję kariery• **Doświadczenie zawodowe** - Czy pasuje do wymagań stanowiska? Sprawdź progresję kariery

• **Umiejętności techniczne** - Czy są aktualne i relevatne dla Twojej branży?• **Umiejętności techniczne** - Czy są aktualne i relevatne dla Twojej branży?

• **Ścieżka rozwoju** - Czy kandydat ma logiczny rozwój i ambitne cele?• **Ścieżka rozwoju** - Czy kandydat ma logiczny rozwój i ambitne cele?

• **Osiągnięcia** - Szukaj konkretnych liczb, projektów i rezultatów• **Osiągnięcia** - Szukaj konkretnych liczb, projektów i rezultatów

• **Wykształcenie** - Czy odpowiada potrzebom firmy?• **Wykształcenie** - Czy odpowiada potrzebom firmy?



**🚨 Red flags:****🚨 Red flags:**

• Luki w CV bez wyjaśnienia (ponad 6 miesięcy)• Luki w CV bez wyjaśnienia (ponad 6 miesięcy)

• Zbyt częste zmiany pracy (co roku)• Zbyt częste zmiany pracy (co roku)

• Brak konkretnych osiągnięć, tylko ogólnikowe opisy• Brak konkretnych osiągnięć, tylko ogólnikowe opisy



**💡 Pro tip:** Zadaj pytanie "Opowiedz mi o swoim największym zawodowym osiągnięciu" - to pokaże prawdziwe kompetencje.**💡 Pro tip:** Zadaj pytanie "Opowiedz mi o swoim największym zawodowym osiągnięciu" - to pokaże prawdziwe kompetencje.



Czy chcesz, żebym pomógł Ci przeanalizować konkretny aspekt kandydata?`;Czy chcesz, żebym pomógł Ci przeanalizować konkretny aspekt kandydata?`;



    case 'teamFit':    case 'teamFit':

      if (message.includes('senior') && message.includes('react')) {      if (message.includes('senior') && message.includes('react')) {

        return `🚀 **Ocena Senior React Developer do zespołu:**        return `🚀 **Ocena Senior React Developer do zespołu:**



**Umiejętności techniczne (must-have):****Umiejętności techniczne (must-have):**

• React 16+, Hooks, Context API• React 16+, Hooks, Context API

• TypeScript/JavaScript ES6+• TypeScript/JavaScript ES6+

• State management (Redux, Zustand)• State management (Redux, Zustand)

• Testing (Jest, React Testing Library)• Testing (Jest, React Testing Library)

• Git workflow, code review• Git workflow, code review



**Umiejętności zespołowe:****Umiejętności zespołowe:**

• **Mentoring** - Czy potrafi dzielić się wiedzą z juniorami?• **Mentoring** - Czy potrafi dzielić się wiedzą z juniorami?

• **Komunikacja** - Czy jasno tłumaczy problemy techniczne?• **Komunikacja** - Czy jasno tłumaczy problemy techniczne?

• **Proaktywność** - Czy proponuje rozwiązania, nie tylko wykonuje zadania?• **Proaktywność** - Czy proponuje rozwiązania, nie tylko wykonuje zadania?



**Pytania weryfikujące:****Pytania weryfikujące:**

1. "Opisz, jak podszedłeś do ostatniego trudnego problemu technicznego"1. "Opisz, jak podszedłeś do ostatniego trudnego problemu technicznego"

2. "Jak przekazujesz wiedzę mniej doświadczonym programistom?"2. "Jak przekazujesz wiedzę mniej doświadczonym programistom?"

3. "Jakie najnowsze trendy w React uważasz za wartościowe?"3. "Jakie najnowsze trendy w React uważasz za wartościowe?"



**Sprawdź kulturę pracy:****Sprawdź kulturę pracy:**

• Czy preferuje pracę zespołową czy indywidualną?• Czy preferuje pracę zespołową czy indywidualną?

• Jak radzi sobie z feedback i krytyką kodu?• Jak radzi sobie z feedback i krytyką kodu?

• Czy ma doświadczenie w pracy z produktem/biznesem?• Czy ma doświadczenie w pracy z produktem/biznesem?



Chcesz konkretne pytania na rozmowę techniczną?`;Chcesz konkretne pytania na rozmowę techniczną?`;

      }      }

      return `👥 **Ocena dopasowania do zespołu:**      return `👥 **Ocena dopasowania do zespołu:**



**Kluczowe aspekty:****Kluczowe aspekty:**

• **Wartości** - Czy pasują do kultury firmy?• **Wartości** - Czy pasują do kultury firmy?

• **Styl komunikacji** - Czy będzie dobrze współpracować?• **Styl komunikacji** - Czy będzie dobrze współpracować?

• **Tempo pracy** - Czy dopasuje się do dynamiki zespołu?• **Tempo pracy** - Czy dopasuje się do dynamiki zespołu?

• **Motywacja** - Co go napędza i czy to się zgadza z celami firmy?• **Motywacja** - Co go napędza i czy to się zgadza z celami firmy?



**Metody oceny:****Metody oceny:**

• Spotkanie z przyszłymi współpracownikami• Spotkanie z przyszłymi współpracownikami

• Zadanie teamowe/case study• Zadanie teamowe/case study

• Pytania o preferencje w pracy• Pytania o preferencje w pracy

• Sprawdzenie referencji• Sprawdzenie referencji



Powiedz mi więcej o stanowisku, a dam Ci konkretne wskazówki!`;Powiedz mi więcej o stanowisku, a dam Ci konkretne wskazówki!`;



    case 'interview':    case 'interview':

      return `💬 **Przygotowanie pytań na rozmowę:**      return `💬 **Przygotowanie pytań na rozmowę:**



**🎯 Pytania techniczne:****🎯 Pytania techniczne:**

• "Opowiedz o najtrudniejszym projekcie, który realizowałeś"• "Opowiedz o najtrudniejszym projekcie, który realizowałeś"

• "Jak debugujesz kod/rozwiązujesz problemy?"• "Jak debugujesz kod/rozwiązujesz problemy?"

• "Jakie technologie chciałbyś poznać w najbliższym czasie?"• "Jakie technologie chciałbyś poznać w najbliższym czasie?"



**🧠 Pytania behawioralne (STAR method):****🧠 Pytania behawioralne (STAR method):**

• "Opisz sytuację, gdy musiałeś przekonać zespół do swojego pomysłu"• "Opisz sytuację, gdy musiałeś przekonać zespół do swojego pomysłu"

• "Jak radzisz sobie z konstruktywną krytyką?"• "Jak radzisz sobie z konstruktywną krytyką?"

• "Opowiedz o błędzie, którego się nauczyłeś"• "Opowiedz o błędzie, którego się nauczyłeś"



**🚀 Pytania motywacyjne:****🚀 Pytania motywacyjne:**

• "Dlaczego chcesz pracować akurat u nas?"• "Dlaczego chcesz pracować akurat u nas?"

• "Gdzie widzisz się za 3 lata?"• "Gdzie widzisz się za 3 lata?"

• "Co jest dla Ciebie najważniejsze w pracy?"• "Co jest dla Ciebie najważniejsze w pracy?"



**💡 Tip:** Używaj follow-up questions: "Możesz podać konkretny przykład?" "Co byś zrobił inaczej?"**� Tip:** Używaj follow-up questions: "Możesz podać konkretny przykład?" "Co byś zrobił inaczej?"



Na jakie stanowisko przygotowujesz pytania? Dam Ci bardziej spersonalizowane porady!`;Na jakie stanowisko przygotowujesz pytania? Dam Ci bardziej spersonalizowane porady!`;



    case 'jobDescription':    case 'jobDescription':

      return `📋 **Struktura skutecznego opisu stanowiska:**      return `📋 **Struktura skutecznego opisu stanowiska:**



**🏷️ Nagłówek (przyciąga uwagę):****🏷️ Nagłówek (przyciąga uwagę):**

• Jasna nazwa stanowiska (bez buzzwordów)• Jasna nazwa stanowiska (bez buzzwordów)

• Lokalizacja + model pracy (remote/hybrid/onsite)• Lokalizacja + model pracy (remote/hybrid/onsite)

• Poziom (junior/mid/senior)• Poziom (junior/mid/senior)

• Widełki wynagrodzenia (zwiększa aplikacje o 30%)• Widełki wynagrodzenia (zwiększa aplikacje o 30%)



**🏢 O nas (2-3 zdania):****🏢 O nas (2-3 zdania):**

• Czym się zajmujecie konkretnie• Czym się zajmujecie konkretnie

• Misja/wartości firmy• Misja/wartości firmy

• Dlaczego warto u was pracować• Dlaczego warto u was pracować



**💼 Twoje zadania:****💼 Twoje zadania:**

• 4-6 najważniejszych obowiązków• 4-6 najważniejszych obowiązków

• Konkretne projekty/cele• Konkretne projekty/cele

• Z kim będziesz współpracować• Z kim będziesz współpracować



**✅ Wymagania:****✅ Wymagania:**

• Must-have (max 5 punktów!)• Must-have (max 5 punktów!)

• Nice-to-have (max 3 punkty)• Nice-to-have (max 3 punkty)

• Konkretne lata doświadczenia• Konkretne lata doświadczenia



**🎁 Oferujemy:****🎁 Oferujemy:**

• Wynagrodzenie + benefity (konkretne kwoty)• Wynagrodzenie + benefity (konkretne kwoty)

• Rozwój zawodowy (kursy, konferencje)• Rozwój zawodowy (kursy, konferencje)

• Work-life balance• Work-life balance



**⚠️ Unikaj:** "Młody, dynamiczny zespół", "Nosiciel wody", "Znajomość wszystkich technologii"**⚠️ Unikaj:** "Młody, dynamiczny zespół", "Nosiciel wody", "Znajomość wszystkich technologii"



Na jakie stanowisko tworzysz opis? Pomogę Ci go dopracować!`;Na jakie stanowisko tworzysz opis? Pomogę Ci go dopracować!`;



    case 'process':    case 'process':

      return `⚡ **Optymalizacja procesu rekrutacyjnego:**      return `⚡ **Optymalizacja procesu rekrutacyjnego:**



**🎯 Kluczowe metryki:****🎯 Kluczowe metryki:**

• Time-to-hire: < 21 dni dla większości ról• Time-to-hire: < 21 dni dla większości ról

• Cost-per-hire: śledzenie kosztów na kandydata• Cost-per-hire: śledzenie kosztów na kandydata

• Quality of hire: ocena po 6-12 miesiącach pracy• Quality of hire: ocena po 6-12 miesiącach pracy

• Candidate experience: NPS kandydatów• Candidate experience: NPS kandydatów



**🚀 Usprawnienia:****🚀 Usprawnienia:**

• **Automatyzacja:** ATS, chatboty, screening calls• **Automatyzacja:** ATS, chatboty, screening calls

• **Standaryzacja:** Szablony pytań, kryteria oceny• **Standaryzacja:** Szablony pytań, kryteria oceny

• **Komunikacja:** Max 48h na feedback• **Komunikacja:** Max 48h na feedback

• **Proces:** Max 3-4 rundy rekrutacji• **Proces:** Max 3-4 rundy rekrutacji



**📊 Przykładowy zoptymalizowany flow:****📊 Przykładowy zoptymalizowany flow:**

1. **Aplikacja** → Auto-response (24h)1. **Aplikacja** → Auto-response (24h)

2. **Screening CV** → Decyzja (48h)2. **Screening CV** → Decyzja (48h)

3. **Pre-screening call** → 15-20 min3. **Pre-screening call** → 15-20 min

4. **Rozmowa merytoryczna** → 45-60 min4. **Rozmowa merytoryczna** → 45-60 min

5. **Zadanie/case study** (opcjonalnie)5. **Zadanie/case study** (opcjonalnie)

6. **Final interview** → 30 min6. **Final interview** → 30 min

7. **Oferta** → 24-48h7. **Oferta** → 24-48h



**💡 Quick wins:****💡 Quick wins:**

• Przygotuj bank pytań dla każdej roli• Przygotuj bank pytań dla każdej roli

• Ustal klarowne kryteria oceny• Ustal klarowne kryteria oceny

• Trenuj interviewerów• Trenuj interviewerów

• Zbieraj feedback od kandydatów• Zbieraj feedback od kandydatów



Które miejsce w Twoim procesie wymaga poprawy?`;Które miejsce w Twoim procesie wymaga poprawy?`;



    case 'skills':    case 'skills':

      return `🎯 **Ocena umiejętności kandydata:**      return `🎯 **Ocena umiejętności kandydata:**



**Metodologie oceny:****Metodologie oceny:**

• **Technical assessment** - praktyczne zadania• **Technical assessment** - praktyczne zadania

• **Behavioral interviews** - STAR method• **Behavioral interviews** - STAR method

• **Case studies** - rozwiązywanie problemów biznesowych• **Case studies** - rozwiązywanie problemów biznesowych

• **Portfolio review** - analiza poprzednich projektów• **Portfolio review** - analiza poprzednich projektów



**Hard skills:****Hard skills:**

• Testy techniczne (live coding, take-home)• Testy techniczne (live coding, take-home)

• Certyfikaty i kursy• Certyfikaty i kursy

• Projekty open source• Projekty open source

• Doświadczenie w praktyce• Doświadczenie w praktyce



**Soft skills:****Soft skills:**

• Komunikacja: Czy jasno się wyraża?• Komunikacja: Czy jasno się wyraża?

• Praca w zespole: Przykłady współpracy• Praca w zespole: Przykłady współpracy

• Adaptacyjność: Jak radzi sobie ze zmianami?• Adaptacyjność: Jak radzi sobie ze zmianami?

• Proaktywność: Czy szuka rozwiązań czy czeka na polecenia?• Proaktywność: Czy szuka rozwiązań czy czeka na polecenia?



**💡 Tip:** Nie oceniaj tylko CV - daj kandydatowi pokazać umiejętności w praktyce!**💡 Tip:** Nie oceniaj tylko CV - daj kandydatowi pokazać umiejętności w praktyce!



Jakie konkretne umiejętności chcesz sprawdzić?`;Jakie konkretne umiejętności chcesz sprawdzić?`;



    case 'salary':    case 'salary':

      return `💰 **Ustalanie wynagrodzenia:**      return `💰 **Ustalanie wynagrodzenia:**



**Czynniki do uwzględnienia:****Czynniki do uwzględnienia:**

• **Doświadczenie:** Lata pracy w branży/roli• **Doświadczenie:** Lata pracy w branży/roli

• **Umiejętności:** Poziom ekspertyzy technicznej• **Umiejętności:** Poziom ekspertyzy technicznej

• **Rynek:** Benchmarki płacowe w branży• **Rynek:** Benchmarki płacowe w branży

• **Lokalizacja:** Różnice regionalne• **Lokalizacja:** Różnice regionalne

• **Wartość:** Jaki biznesowy impact przyniesie?• **Wartość:** Jaki biznesowy impact przyniesie?



**Negocjacje:****Negocjacje:**

• Poznaj oczekiwania wcześnie (1-2 rozmowa)• Poznaj oczekiwania wcześnie (1-2 rozmowa)

• Przedstaw pełny pakiet (nie tylko base salary)• Przedstaw pełny pakiet (nie tylko base salary)

• Bądź transparentny z widełkami• Bądź transparentny z widełkami

• Zostaw miejsce na negocjacje (10-15%)• Zostaw miejsce na negocjacje (10-15%)



**Alternatywy do wyższej pensji:****Alternatywy do wyższej pensji:**

• Dodatkowe dni urlopu• Dodatkowe dni urlopu

• Elastyczne godziny pracy• Elastyczne godziny pracy

• Budżet na rozwój/kursy• Budżet na rozwój/kursy

• Opcje akcyjne/bonus roczny• Opcje akcyjne/bonus roczny

• Benefity (prywatna opieka medyczna, multisport)• Benefity (prywatna opieka medyczna, multisport)



**📊 Gdzie sprawdzić rynek:****📊 Gdzie sprawdzić rynek:**

• No Fluff Jobs Salary Report• No Fluff Jobs Salary Report

• PayScale, Glassdoor• PayScale, Glassdoor

• Raporty branżowe• Raporty branżowe

• Networking z innymi HR-owcami• Networking z innymi HR-owcami



Jaka rola Cię interesuje? Pomogę z benchmarkiem!`;Jaka rola Cię interesuje? Pomogę z benchmarkiem!`;



    case 'onboarding':    case 'onboarding':

      return `🚀 **Skuteczny proces wdrożenia (onboarding):**      return `🚀 **Skuteczny proces wdrożenia (onboarding):**



**Pre-boarding (przed 1. dniem):****Pre-boarding (przed 1. dniem):**

• Wysłanie welcome pack z info o firmie• Wysłanie welcome pack z info o firmie

• Przygotowanie stanowiska pracy i accesów• Przygotowanie stanowiska pracy i accesów

• Przedstawienie buddy/mentora• Przedstawienie buddy/mentora

• Plan pierwszego tygodnia• Plan pierwszego tygodnia



**Pierwszy dzień:****Pierwszy dzień:**

• Powitanie i tour po biurze/firmie• Powitanie i tour po biurze/firmie

• Spotkanie z zespołem i kluczowymi osobami• Spotkanie z zespołem i kluczowymi osobami

• Przegląd kultury firmy i wartości• Przegląd kultury firmy i wartości

• Ustawienie celów na pierwsze 30/60/90 dni• Ustawienie celów na pierwsze 30/60/90 dni



**Pierwsze 30 dni:****Pierwsze 30 dni:**

• Regularne check-iny (tygodniowo)• Regularne check-iny (tygodniowo)

• Podstawowe szkolenia i procedury• Podstawowe szkolenia i procedury

• Pierwsze projekty/zadania• Pierwsze projekty/zadania

• Feedback session po 30 dniach• Feedback session po 30 dniach



**💡 Best practices:****💡 Best practices:**

• Przygotuj checklist dla managera• Przygotuj checklist dla managera

• Zbieraj feedback od nowego pracownika• Zbieraj feedback od nowego pracownika

• Nie przytłaczaj informacjami od razu• Nie przytłaczaj informacjami od razu

• Fokus na kulturę i relacje, nie tylko zadania• Fokus na kulturę i relacje, nie tylko zadania



**📊 Metryki sukcesu:****📊 Metryki sukcesu:**

• Czas do pełnej produktywności• Czas do pełnej produktywności

• Satysfakcja nowego pracownika (survey)• Satysfakcja nowego pracownika (survey)

• Retention rate po 6/12 miesiącach• Retention rate po 6/12 miesiącach



Chcesz konkretny plan onboardingu dla jakiejś roli?`;Chcesz konkretny plan onboardingu dla jakiejś roli?`;



    default:    default:

      // Odpowiedź ogólna gdy nie można dopasować kategorii      // Odpowiedź ogólna gdy nie można dopasować kategorii

      return `Cześć! Jestem Twoim asystentem HR specjalizującym się w rekrutacji i zarządzaniu talentami. 🤖      return `Cześć! Jestem Twoim asystentem HR specjalizującym się w rekrutacji i zarządzaniu talentami. 🤖



**🎯 W czym mogę Ci pomóc:****🎯 W czym mogę Ci pomóc:**

• **Analiza kandydatów** - ocena CV, dopasowanie do roli• **Analiza kandydatów** - ocena CV, dopasowanie do roli

• **Przygotowanie rozmów** - pytania techniczne i behawioralne  • **Przygotowanie rozmów** - pytania techniczne i behawioralne  

• **Opisy stanowisk** - skuteczne job posty• **Opisy stanowisk** - skuteczne job posty

• **Optymalizacja procesów** - usprawnienie rekrutacji• **Optymalizacja procesów** - usprawnienie rekrutacji

• **Zarządzanie zespołem** - onboarding, retention, rozwój• **Zarządzanie zespołem** - onboarding, retention, rozwój



**💡 Przykłady pytań:****💡 Przykłady pytań:**

"Jak ocenić kandidata na stanowisko senior developera?""Jak ocenić kandidata na stanowisko senior developera?"

"Jakie pytania zadać na rozmowie z product managerem?""Jakie pytania zadać na rozmowie z product managerem?"

"Jak skrócić czas rekrutacji?""Jak skrócić czas rekrutacji?"

"Przygotuj opis stanowiska dla UX designera""Przygotuj opis stanowiska dla UX designera"



**Zadaj mi konkretne pytanie, a otrzymasz szczegółową, praktyczną odpowiedź!** **Zadaj mi konkretne pytanie, a otrzymasz szczegółową, praktyczną odpowiedź!** 



*Moje odpowiedzi opierają się na najlepszych praktykach HR i są dostosowane do polskiego rynku pracy.*`;*Moje odpowiedzi opierają się na najlepszych praktykach HR i są dostosowane do polskiego rynku pracy.*`;

  }  }

}}



export async function POST(req: NextRequest) {export async function POST(req: NextRequest) {

  try {  try {

    console.log("🤖 AI Chat API: Received request");    console.log("🤖 AI Chat API: Received request");

    const body = await req.json();    const body = await req.json();

        

    if (!body.messages || !Array.isArray(body.messages)) {    if (!body.messages || !Array.isArray(body.messages)) {

      console.log("❌ AI Chat API: Invalid message format");      console.log("❌ AI Chat API: Invalid message format");

      return NextResponse.json(      return NextResponse.json(

        { error: "Nieprawidłowy format wiadomości" },        { error: "Nieprawidłowy format wiadomości" },

        { status: 400 }        { status: 400 }

      );      );

    }    }



    // Build conversation context    // Build conversation context

    const messages = body.messages as ChatMessage[];    const messages = body.messages as ChatMessage[];

    const conversationHistory = messages    const conversationHistory = messages

      .slice(-10) // Last 10 messages for context      .slice(-10) // Last 10 messages for context

      .map(msg => `${msg.role === "user" ? "Użytkownik" : "Asystent"}: ${msg.content}`)      .map(msg => `${msg.role === "user" ? "Użytkownik" : "Asystent"}: ${msg.content}`)

      .join("\n\n");      .join("\n\n");

        

    const lastUserMessage = messages.filter(m => m.role === "user").pop()?.content || "";    const lastUserMessage = messages.filter(m => m.role === "user").pop()?.content || "";

        

    if (!lastUserMessage) {    if (!lastUserMessage) {

      console.log("❌ AI Chat API: No user message found");      console.log("❌ AI Chat API: No user message found");

      return NextResponse.json(      return NextResponse.json(

        { error: "Brak wiadomości użytkownika" },        { error: "Brak wiadomości użytkownika" },

        { status: 400 }        { status: 400 }

      );      );

    }    }



    console.log("📝 AI Chat API: User message:", lastUserMessage);    console.log("📝 AI Chat API: User message:", lastUserMessage);



    // Inteligentny system odpowiedzi HR    try {

    const intelligentResponse = generateIntelligentHRResponse(lastUserMessage, conversationHistory);      console.log("🚀 Connecting to AI model...");

          

    console.log("✅ Generated intelligent HR response");      // Użyjmy stabilnego modelu text-generation

          const client = await Client.connect("mistralai/Mistral-7B-Instruct-v0.1");

    return NextResponse.json({       

      answer: intelligentResponse,      // Prepare HR-focused prompt

      model: "Advanced HR Assistant v2.0",      const hrPrompt = `Jesteś asystentem HR. Odpowiedz na pytanie: ${lastUserMessage}`;

      provider: "Intelligent Response System"

    });      console.log("🧠 Sending prompt to AI model...");

      

  } catch (error) {      // Call the AI model with text generation

    console.error("💥 AI Chat API Error:", error);      const result = await client.predict("/predict", [hrPrompt]);

    

    return NextResponse.json(      console.log("✅ AI model response received", result);

      {       

        error: "Wystąpił błąd podczas komunikacji z asystentem AI. Spróbuj ponownie za chwilę.",      // Extract the response from the result

        model: "error"      let aiResponse = "Przepraszam, wystąpił problem z generowaniem odpowiedzi.";

      },      

      { status: 500 }      if (result && typeof result === 'object' && 'data' in result) {

    );        const data = result.data as any[];

  }        if (Array.isArray(data) && data.length > 0) {

}          // Get the first non-empty response

          aiResponse = data[0] || data[1] || aiResponse;

// Handle OPTIONS for CORS          

export async function OPTIONS() {          // If response is too generic, create a HR-specific response

  return new NextResponse(null, {          if (aiResponse.length < 10) {

    status: 200,            aiResponse = `Jako asystent HR mogę pomóc Ci z pytaniem: "${lastUserMessage}". W kontekście rekrutacji i zarządzania talentami, oto moja sugestia: [Odpowiedź wymaga dalszego rozwoju modelu AI]`;

    headers: {          }

      'Access-Control-Allow-Origin': '*',        }

      'Access-Control-Allow-Methods': 'POST, OPTIONS',      }

      'Access-Control-Allow-Headers': 'Content-Type',      

    },      return NextResponse.json({ 

  });        answer: aiResponse,

}        model: "Mistral-7B-Instruct-v0.1",
        provider: "Mistral AI / HuggingFace" 
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
>>>>>>> 4d0541d36d9d9313bb5f30da37ae7872b55eab3c
}