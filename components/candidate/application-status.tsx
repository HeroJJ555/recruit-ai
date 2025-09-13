"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Building, Calendar, Clock, CheckCircle, AlertCircle, XCircle, MessageSquare } from "lucide-react"

export function ApplicationStatus() {
  // Mock application data - in real app this would come from API
  const applications = [
    {
      id: 1,
      jobTitle: "Senior Frontend Developer",
      company: "TechCorp",
      appliedDate: "2024-01-15",
      status: "interview",
      stage: "Rozmowa techniczna",
      progress: 75,
      nextStep: "Rozmowa z zespołem - 20.01.2024",
      feedback: "Bardzo dobre wyniki w teście technicznym. Przechodzimy do kolejnego etapu.",
    },
    {
      id: 2,
      jobTitle: "React Developer",
      company: "StartupXYZ",
      appliedDate: "2024-01-10",
      status: "pending",
      stage: "Oczekiwanie na odpowiedź",
      progress: 25,
      nextStep: "Oczekiwanie na kontakt od rekrutera",
      feedback: null,
    },
    {
      id: 3,
      jobTitle: "Full Stack Developer",
      company: "FinTech Solutions",
      appliedDate: "2024-01-05",
      status: "rejected",
      stage: "Odrzucona",
      progress: 100,
      nextStep: null,
      feedback: "Dziękujemy za zainteresowanie. W tej chwili wybraliśmy innego kandydata.",
    },
    {
      id: 4,
      jobTitle: "Frontend Developer",
      company: "E-commerce Plus",
      appliedDate: "2024-01-12",
      status: "accepted",
      stage: "Oferta zaakceptowana",
      progress: 100,
      nextStep: "Podpisanie umowy - 25.01.2024",
      feedback: "Gratulacje! Cieszymy się, że dołączysz do naszego zespołu.",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "interview":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Oczekiwanie
          </Badge>
        )
      case "interview":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Rozmowa
          </Badge>
        )
      case "accepted":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Zaakceptowana
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Odrzucona
          </Badge>
        )
      default:
        return <Badge variant="secondary">Nieznany</Badge>
    }
  }

  const stats = {
    total: applications.length,
    pending: applications.filter((app) => app.status === "pending").length,
    interviews: applications.filter((app) => app.status === "interview").length,
    accepted: applications.filter((app) => app.status === "accepted").length,
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-foreground">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Wszystkie aplikacje</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Oczekujące</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.interviews}</div>
            <div className="text-sm text-muted-foreground">Rozmowy</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.accepted}</div>
            <div className="text-sm text-muted-foreground">Zaakceptowane</div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-heading">Moje aplikacje</CardTitle>
          <CardDescription>Śledź status swoich aplikacji i otrzymuj aktualizacje w czasie rzeczywistym</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {applications.map((app) => (
              <Card key={app.id} className="border-border">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-heading font-semibold text-foreground mb-1">{app.jobTitle}</h3>
                          <div className="flex items-center space-x-4 text-muted-foreground text-sm">
                            <div className="flex items-center space-x-1">
                              <Building className="h-4 w-4" />
                              <span>{app.company}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Aplikowano: {app.appliedDate}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(app.status)}
                          {getStatusBadge(app.status)}
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">{app.stage}</span>
                          <span className="text-sm text-muted-foreground">{app.progress}%</span>
                        </div>
                        <Progress value={app.progress} className="h-2" />
                      </div>

                      {app.nextStep && (
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm font-medium text-blue-900">Następny krok:</div>
                          <div className="text-sm text-blue-700">{app.nextStep}</div>
                        </div>
                      )}

                      {app.feedback && (
                        <div className="mb-3 p-3 bg-muted/50 rounded-lg">
                          <div className="text-sm font-medium text-foreground mb-1">Feedback od rekrutera:</div>
                          <div className="text-sm text-muted-foreground">{app.feedback}</div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 lg:w-48">
                      {app.status === "interview" && (
                        <Button className="w-full">
                          <Calendar className="h-4 w-4 mr-2" />
                          Umów rozmowę
                        </Button>
                      )}
                      <Button variant="outline" className="w-full bg-transparent">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Wiadomości
                      </Button>
                      {app.status === "accepted" && (
                        <Button variant="outline" className="w-full bg-green-50 border-green-200 text-green-700">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Zobacz ofertę
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            <span>AI Insights</span>
          </CardTitle>
          <CardDescription>Personalizowane wskazówki oparte na Twoich aplikacjach</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-900 mb-1">Zwiększ swoje szanse</div>
              <div className="text-sm text-blue-700">
                Kandydaci z uzupełnionym portfolio mają 60% więcej szans na przejście do kolejnego etapu.
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="font-medium text-green-900 mb-1">Dobra wiadomość!</div>
              <div className="text-sm text-green-700">
                Twój profil idealnie pasuje do 12 nowych ofert pracy. Sprawdź zakładkę "Oferty".
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
