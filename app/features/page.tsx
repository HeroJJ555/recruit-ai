import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Users, FileText, BarChart3, MessageSquare, Zap, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function FeaturesPage() {
  const features = [
    {
      icon: Brain,
      title: "Asystent AI Rekrutera",
      description: "Zaawansowany AI analizuje CV, generuje pytania rekrutacyjne i pomaga w ocenie kandydatów",
      benefits: ["Automatyczna analiza CV", "Generowanie pytań", "Ocena kompetencji", "Rekomendacje"],
    },
    {
      icon: Users,
      title: "Zarządzanie Kandydatami",
      description: "Kompleksowy system zarządzania bazą kandydatów z zaawansowanymi filtrami",
      benefits: ["Baza kandydatów", "Zaawansowane filtry", "Historia kontaktów", "Notatki rekrutera"],
    },
    {
      icon: FileText,
      title: "Analiza Dokumentów",
      description: "AI automatycznie analizuje CV i listy motywacyjne, wyciągając kluczowe informacje",
      benefits: ["Parsing CV", "Analiza umiejętności", "Dopasowanie do ofert", "Ranking kandydatów"],
    },
    {
      icon: BarChart3,
      title: "Analityka i Raporty",
      description: "Szczegółowe raporty i analityki procesu rekrutacyjnego",
      benefits: ["Metryki rekrutacji", "Czas zatrudnienia", "Źródła kandydatów", "ROI procesów"],
    },
    {
      icon: MessageSquare,
      title: "Komunikacja z Kandydatami",
      description: "Zautomatyzowana komunikacja z kandydatami na każdym etapie rekrutacji",
      benefits: ["Automatyczne e-maile", "Statusy aplikacji", "Harmonogram rozmów", "Feedback"],
    },
    {
      icon: Zap,
      title: "Automatyzacja Procesów",
      description: "Automatyzacja rutynowych zadań rekrutacyjnych oszczędza czas i zwiększa efektywność",
      benefits: ["Workflow automation", "Zadania cykliczne", "Przypomnienia", "Integracje"],
    },
  ]

  const aiCapabilities = [
    "Analiza CV w czasie rzeczywistym",
    "Generowanie spersonalizowanych pytań rekrutacyjnych",
    "Ocena dopasowania kandydata do stanowiska",
    "Automatyczne tworzenie raportów z rozmów",
    "Predykcja sukcesu kandydata",
    "Optymalizacja procesu rekrutacyjnego",
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              Zaawansowane funkcje AI
            </Badge>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6 text-balance">
              Funkcje które <span className="text-primary">rewolucjonizują</span> rekrutację
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty">
              Odkryj jak nasze narzędzia AI mogą przyspieszyć Twój proces rekrutacyjny i pomóc w znalezieniu idealnych
              kandydatów.
            </p>
          </div>
        </section>

        {/* Main Features Grid */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="bg-primary/10 rounded-lg p-3 w-fit mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-heading">{feature.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* AI Capabilities */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Możliwości AI</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Nasz asystent AI wykorzystuje najnowsze technologie do wsparcia procesu rekrutacyjnego
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <ul className="space-y-4">
                  {aiCapabilities.map((capability, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-primary rounded-full p-1 mr-3 mt-1">
                        <CheckCircle className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <span className="text-foreground">{capability}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-background rounded-lg p-8 border border-border">
                <div className="flex items-center mb-4">
                  <Brain className="h-8 w-8 text-primary mr-3" />
                  <h3 className="text-xl font-heading font-semibold">Asystent AI</h3>
                </div>
                <p className="text-muted-foreground mb-6">Gotowy do integracji z najpopularniejszymi modelami AI:</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">OpenAI GPT-4</span>
                    <Badge variant="secondary">API Ready</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Claude 3</span>
                    <Badge variant="secondary">API Ready</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Gemini Pro</span>
                    <Badge variant="secondary">API Ready</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">Rozpocznij już dziś</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Dołącz do setek firm, które już korzystają z naszej platformy rekrutacyjnej
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/recruiter">
                <Button size="lg" className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Panel Rekrutera</span>
                </Button>
              </Link>
              <Link href="/candidate">
                <Button variant="outline" size="lg" className="flex items-center space-x-2 bg-transparent">
                  <FileText className="h-5 w-5" />
                  <span>Panel Kandydata</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
