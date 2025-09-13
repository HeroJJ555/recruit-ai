import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, X, Zap, Building, Fingerprint as Enterprise } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "299",
      period: "miesięcznie",
      description: "Idealny dla małych firm i startupów",
      icon: Zap,
      popular: false,
      features: [
        "Do 50 kandydatów miesięcznie",
        "Podstawowa analiza CV",
        "5 szablonów e-maili",
        "Podstawowe raporty",
        "Support e-mail",
        "Integracja z 2 portalami pracy",
      ],
      limitations: ["Brak zaawansowanej analityki", "Ograniczone API calls", "Brak custom brandingu"],
    },
    {
      name: "Professional",
      price: "599",
      period: "miesięcznie",
      description: "Dla średnich firm z większymi potrzebami",
      icon: Building,
      popular: true,
      features: [
        "Do 200 kandydatów miesięcznie",
        "Zaawansowana analiza AI",
        "Nieograniczone szablony",
        "Pełne raporty i analityka",
        "Support priorytetowy",
        "Integracja z wszystkimi portalami",
        "Custom branding",
        "Automatyzacja workflow",
        "API dostęp",
      ],
      limitations: ["Ograniczone storage", "Brak white-label"],
    },
    {
      name: "Enterprise",
      price: "Indywidualnie",
      period: "skontaktuj się",
      description: "Dla dużych organizacji z kompleksowymi potrzebami",
      icon: Enterprise,
      popular: false,
      features: [
        "Nieograniczona liczba kandydatów",
        "Dedykowany asystent AI",
        "Custom integracje",
        "Zaawansowana analityka",
        "24/7 Support",
        "White-label rozwiązanie",
        "Dedykowany account manager",
        "SLA gwarancje",
        "On-premise deployment",
        "Custom training AI",
      ],
      limitations: [],
    },
  ]

  const faqs = [
    {
      question: "Czy mogę zmienić plan w dowolnym momencie?",
      answer:
        "Tak, możesz zmienić plan w dowolnym momencie. Zmiany wchodzą w życie od następnego cyklu rozliczeniowego.",
    },
    {
      question: "Czy oferujecie okres próbny?",
      answer: "Tak, oferujemy 14-dniowy bezpłatny okres próbny dla wszystkich planów. Nie wymagamy karty kredytowej.",
    },
    {
      question: "Jak działa rozliczanie?",
      answer: "Rozliczenia odbywają się miesięcznie z góry. Akceptujemy płatności kartą, przelewem i fakturami.",
    },
    {
      question: "Czy dane są bezpieczne?",
      answer: "Tak, wszystkie dane są szyfrowane i przechowywane zgodnie z RODO. Posiadamy certyfikaty bezpieczeństwa.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              Przejrzyste ceny
            </Badge>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6 text-balance">
              Wybierz plan <span className="text-primary">idealny</span> dla Twojej firmy
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Bez ukrytych kosztów. Bez długoterminowych zobowiązań. Rozpocznij z 14-dniowym bezpłatnym okresem próbnym.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <Card
                  key={index}
                  className={`relative border-border ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                      Najpopularniejszy
                    </Badge>
                  )}

                  <CardHeader className="text-center pb-8">
                    <div className="bg-primary/10 rounded-lg p-3 w-fit mx-auto mb-4">
                      <plan.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-heading">{plan.name}</CardTitle>
                    <CardDescription className="text-muted-foreground mb-4">{plan.description}</CardDescription>
                    <div className="text-center">
                      {plan.price === "Indywidualnie" ? (
                        <div className="text-3xl font-bold text-foreground">{plan.price}</div>
                      ) : (
                        <>
                          <div className="text-4xl font-bold text-foreground">{plan.price} zł</div>
                          <div className="text-muted-foreground">/{plan.period}</div>
                        </>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-foreground">Funkcje:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start text-sm">
                            <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {plan.limitations.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-muted-foreground">Ograniczenia:</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, idx) => (
                            <li key={idx} className="flex items-start text-sm">
                              <X className="h-4 w-4 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-4">
                      {plan.price === "Indywidualnie" ? (
                        <Link href="/contact">
                          <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                            Skontaktuj się
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/recruiter">
                          <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                            Rozpocznij okres próbny
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                Często zadawane pytania
              </h2>
              <p className="text-lg text-muted-foreground">
                Odpowiedzi na najczęściej zadawane pytania dotyczące naszych planów
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg font-heading">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">Gotowy na start?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Dołącz do setek firm, które już oszczędzają czas dzięki naszej platformie
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/recruiter">
                <Button size="lg">Rozpocznij bezpłatny okres próbny</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Porozmawiaj z ekspertem
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
