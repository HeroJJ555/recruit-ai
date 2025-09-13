"use client"

import type React from "react"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, Clock, MessageSquare, Users, Zap } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    subject: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Integrate with contact API
    console.log("[v0] Contact form submitted:", formData)
    alert("Dziękujemy za wiadomość! Skontaktujemy się z Tobą w ciągu 24 godzin.")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "kontakt@recruitai.pl",
      description: "Odpowiadamy w ciągu 2 godzin",
    },
    {
      icon: Phone,
      title: "Telefon",
      value: "+48 22 123 45 67",
      description: "Pon-Pt 9:00-17:00",
    },
    {
      icon: MapPin,
      title: "Adres",
      value: "ul. Technologiczna 1, 00-001 Warszawa",
      description: "Nasze biuro w centrum Warszawy",
    },
    {
      icon: Clock,
      title: "Godziny pracy",
      value: "Pon-Pt 9:00-17:00",
      description: "Wsparcie techniczne 24/7",
    },
  ]

  const supportOptions = [
    {
      icon: MessageSquare,
      title: "Wsparcie techniczne",
      description: "Pomoc z konfiguracją i problemami technicznymi",
      action: "support@recruitai.pl",
    },
    {
      icon: Users,
      title: "Sprzedaż",
      description: "Informacje o planach i cenach",
      action: "sprzedaz@recruitai.pl",
    },
    {
      icon: Zap,
      title: "Partnerstwa",
      description: "Współpraca biznesowa i integracje",
      action: "partnerzy@recruitai.pl",
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
              Skontaktuj się z nami
            </Badge>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6 text-balance">
              Masz pytania? <span className="text-primary">Jesteśmy tutaj</span> aby pomóc
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Nasz zespół ekspertów jest gotowy odpowiedzieć na wszystkie Twoje pytania dotyczące platformy
              rekrutacyjnej i pomocy w implementacji.
            </p>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-2xl font-heading">Wyślij wiadomość</CardTitle>
                  <CardDescription>Wypełnij formularz, a skontaktujemy się z Tobą w ciągu 24 godzin</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Imię i nazwisko *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Jan Kowalski"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="jan@firma.pl"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Firma</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => handleInputChange("company", e.target.value)}
                          placeholder="Nazwa firmy"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefon</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="+48 123 456 789"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Temat *</Label>
                      <Select onValueChange={(value) => handleInputChange("subject", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz temat" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="demo">Chcę zobaczyć demo</SelectItem>
                          <SelectItem value="pricing">Pytania o cennik</SelectItem>
                          <SelectItem value="technical">Wsparcie techniczne</SelectItem>
                          <SelectItem value="partnership">Partnerstwo</SelectItem>
                          <SelectItem value="other">Inne</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Wiadomość *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        placeholder="Opisz swoje potrzeby lub zadaj pytanie..."
                        rows={5}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      Wyślij wiadomość
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Informacje kontaktowe</h2>
                  <div className="grid gap-6">
                    {contactInfo.map((info, index) => (
                      <Card key={index} className="border-border">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="bg-primary/10 rounded-lg p-3">
                              <info.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                              <p className="text-foreground mb-1">{info.value}</p>
                              <p className="text-sm text-muted-foreground">{info.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Specjalistyczne wsparcie</h2>
                  <div className="space-y-4">
                    {supportOptions.map((option, index) => (
                      <Card key={index} className="border-border">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="bg-primary/10 rounded-lg p-2">
                              <option.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground mb-1">{option.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{option.description}</p>
                              <a href={`mailto:${option.action}`} className="text-sm text-primary hover:underline">
                                {option.action}
                              </a>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Szybkie odpowiedzi</h2>
              <p className="text-lg text-muted-foreground">Najczęściej zadawane pytania i odpowiedzi</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Jak szybko mogę rozpocząć?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Możesz rozpocząć natychmiast! Rejestracja trwa 2 minuty, a pierwszych kandydatów możesz dodać już po
                    5 minutach.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Czy oferujecie szkolenia?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Tak! Każdy nowy klient otrzymuje bezpłatne szkolenie online oraz dostęp do bazy wiedzy i materiałów
                    edukacyjnych.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Jakie integracje oferujecie?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Integrujemy się z popularnymi portalami pracy, systemami HR, kalendarzami i narzędziami komunikacji.
                    Pełna lista w dokumentacji.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Czy dane są bezpieczne?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Absolutnie! Używamy szyfrowania end-to-end, jesteśmy zgodni z RODO i posiadamy certyfikaty
                    bezpieczeństwa ISO 27001.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
