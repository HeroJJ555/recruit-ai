import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Award, Heart, Lightbulb } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const team = [
    {
      name: "Anna Kowalska",
      role: "CEO & Founder",
      description: "15 lat doświadczenia w HR i rekrutacji. Wcześniej Head of Talent w Google.",
      image: "/professional-woman-ceo.png",
    },
    {
      name: "Michał Nowak",
      role: "CTO",
      description: "Expert w dziedzinie AI i machine learning. Były senior engineer w Microsoft.",
      image: "/professional-man-cto.png",
    },
    {
      name: "Katarzyna Wiśniewska",
      role: "Head of Product",
      description: "Specjalistka UX/UI z 10-letnim doświadczeniem w produktach B2B.",
      image: "/professional-woman-product-manager.png",
    },
    {
      name: "Tomasz Zieliński",
      role: "Head of AI",
      description: "PhD w dziedzinie sztucznej inteligencji. Autor 50+ publikacji naukowych.",
      image: "/professional-man-ai-researcher.jpg",
    },
  ]

  const values = [
    {
      icon: Target,
      title: "Precyzja",
      description: "Dokładnie dopasowujemy kandydatów do stanowisk dzięki zaawansowanym algorytmom AI",
    },
    {
      icon: Heart,
      title: "Empatia",
      description: "Rozumiemy potrzeby zarówno rekruterów jak i kandydatów, tworząc pozytywne doświadczenia",
    },
    {
      icon: Lightbulb,
      title: "Innowacyjność",
      description: "Ciągle rozwijamy nasze technologie, aby być o krok przed konkurencją",
    },
    {
      icon: Award,
      title: "Jakość",
      description: "Każda funkcja jest starannie przetestowana i zoptymalizowana dla najlepszych rezultatów",
    },
  ]

  const stats = [
    { number: "10,000+", label: "Zadowolonych rekruterów" },
    { number: "500,000+", label: "Przeanalizowanych CV" },
    { number: "95%", label: "Trafność dopasowań" },
    { number: "60%", label: "Oszczędność czasu" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              Nasza historia
            </Badge>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6 text-balance">
              Rewolucjonizujemy <span className="text-primary">rekrutację</span> dzięki AI
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Jesteśmy zespołem ekspertów HR i technologii, którzy wierzą, że sztuczna inteligencja może uczynić
              rekrutację bardziej efektywną i sprawiedliwą dla wszystkich.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">Nasza misja</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Wierzymy, że każda firma zasługuje na dostęp do najlepszych talentów, a każdy kandydat na sprawiedliwą
                  ocenę swoich umiejętności.
                </p>
                <p className="text-lg text-muted-foreground mb-8">
                  Dlatego stworzyliśmy platformę, która wykorzystuje moc sztucznej inteligencji do eliminowania
                  uprzedzeń, przyspieszania procesów i poprawy jakości rekrutacji.
                </p>
                <Link href="/features">
                  <Button size="lg">Poznaj nasze funkcje</Button>
                </Link>
              </div>
              <div className="bg-background rounded-lg p-8 border border-border">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Nasze wartości</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Wartości, które kierują nami w codziennej pracy i rozwoju produktu
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="border-border text-center">
                  <CardHeader>
                    <div className="bg-primary/10 rounded-lg p-3 w-fit mx-auto mb-4">
                      <value.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-heading">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Nasz zespół</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Poznaj ludzi, którzy codziennie pracują nad udoskonalaniem rekrutacji
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="border-border text-center">
                  <CardHeader>
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                      <img
                        src={member.image || "/placeholder.svg"}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardTitle className="text-xl font-heading">{member.name}</CardTitle>
                    <CardDescription className="text-primary font-medium">{member.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Nasza historia</h2>
            </div>

            <div className="space-y-8">
              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary">2020</Badge>
                    <CardTitle className="text-xl font-heading">Początek</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Założyciele spotkali się podczas konferencji HR Tech i zdecydowali się połączyć swoje doświadczenia
                    w HR i technologii, aby rozwiązać problemy rekrutacji.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary">2021</Badge>
                    <CardTitle className="text-xl font-heading">Pierwszy produkt</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Uruchomiliśmy pierwszą wersję platformy z podstawową analizą CV. Pierwsi klienci oszczędzili 40%
                    czasu na wstępnej selekcji kandydatów.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary">2023</Badge>
                    <CardTitle className="text-xl font-heading">Przełom AI</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Wprowadziliśmy zaawansowanego asystenta AI, który nie tylko analizuje CV, ale także generuje pytania
                    rekrutacyjne i pomaga w ocenie kandydatów.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary">2024</Badge>
                    <CardTitle className="text-xl font-heading">Dziś</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Obsługujemy ponad 10,000 rekruterów w całej Europie i ciągle rozwijamy nasze możliwości AI, aby
                    uczynić rekrutację jeszcze bardziej efektywną.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">Dołącz do nas</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Rozpocznij swoją przygodę z inteligentną rekrutacją już dziś
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/recruiter">
                <Button size="lg">Rozpocznij bezpłatny okres próbny</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Skontaktuj się z nami
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
