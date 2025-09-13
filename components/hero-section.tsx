import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Brain, Zap, Target, Users, FileText, BarChart3 } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative py-20 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
      <div className="max-w-7xl mx-auto">
        {/* Hero Content */}
        <div className="text-center mb-16">
          <h1 className="font-heading font-bold text-4xl md:text-6xl lg:text-7xl text-balance mb-6">
            Przyszłość rekrutacji
            <span className="text-primary block">z asystentem AI</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground text-balance max-w-3xl mx-auto mb-8">
            Zrewolucjonizuj swój proces rekrutacyjny dzięki zaawansowanej sztucznej inteligencji. Automatyzuj, analizuj
            i znajdź idealnych kandydatów szybciej niż kiedykolwiek.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/recruiter">
              <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6">
                <Users className="mr-2 h-5 w-5" />
                Rozpocznij jako Rekruter
              </Button>
            </Link>
            <Link href="/candidate">
              <Button variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-transparent">
                <FileText className="mr-2 h-5 w-5" />
                Złóż CV jako Kandydat
              </Button>
            </Link>
          </div>
        </div>

  {/* Features Grid */}
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="bg-primary/10 rounded-lg p-3 w-fit mb-4">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-3">Asystent AI Rekrutera</h3>
              <p className="text-muted-foreground">
                Inteligentny asystent wspiera Cię na każdym etapie rekrutacji - od analizy CV po prowadzenie rozmów.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="bg-secondary/10 rounded-lg p-3 w-fit mb-4">
                <Zap className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-3">Automatyzacja Procesów</h3>
              <p className="text-muted-foreground">
                Zautomatyzuj rutynowe zadania i skup się na tym, co najważniejsze - budowaniu relacji z kandydatami.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="bg-accent/10 rounded-lg p-3 w-fit mb-4">
                <Target className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-3">Precyzyjne Dopasowanie</h3>
              <p className="text-muted-foreground">
                Algorytmy AI analizują kompetencje i dopasowują idealnych kandydatów do Twoich wymagań.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="bg-chart-1/10 rounded-lg p-3 w-fit mb-4">
                <BarChart3 className="h-8 w-8 text-chart-1" />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-3">Analityka i Raporty</h3>
              <p className="text-muted-foreground">
                Szczegółowe analizy procesu rekrutacyjnego pomagają optymalizować strategię HR.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="bg-chart-2/10 rounded-lg p-3 w-fit mb-4">
                <FileText className="h-8 w-8 text-chart-2" />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-3">Prosty Panel Kandydata</h3>
              <p className="text-muted-foreground">
                Intuicyjny interfejs dla kandydatów do składania CV i śledzenia statusu aplikacji.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="bg-chart-3/10 rounded-lg p-3 w-fit mb-4">
                <Users className="h-8 w-8 text-chart-3" />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-3">Zarządzanie Talentami</h3>
              <p className="text-muted-foreground">
                Kompleksowe narzędzia do zarządzania bazą kandydatów i budowania puli talentów.
              </p>
            </CardContent>
          </Card>
  </div>

  {/* CTA Section */
  }
        <div className="text-center bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 md:p-12">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl mb-3 md:mb-4">Gotowy na rewolucję w rekrutacji?</h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
            Dołącz do tysięcy firm, które już wykorzystują moc AI w procesach HR
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/recruiter">
              <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6">
                Zacznij bezpłatnie
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-transparent">
                Zobacz demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
