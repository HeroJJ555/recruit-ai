import { Sidebar } from "@/components/recruiter/sidebar"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { AIAssistantWidget } from "@/components/recruiter/ai-assistant-widget"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, MessageSquare, Users, FileText, TrendingUp } from "lucide-react"

export default async function AIAssistantPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/signin")
  
  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 flex-shrink-0" />
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-2xl leading-tight flex items-center space-x-2">
              <Brain className="h-6 w-6 text-primary" />
              <span>Asystent AI dla Rekruterów</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Profesjonalny asystent AI specjalizujący się w rekrutacji i HR. Zadaj pytanie aby otrzymać ekspertową pomoc.
            </p>
          </div>
        </header>

        {/* Quick Help Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span>Analiza Kandydatów</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-xs">
                Pomoc w ocenie CV, kompetencji i dopasowania kandydatów do stanowisk
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <FileText className="h-4 w-4 text-green-500" />
                <span>Opisy Stanowisk</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-xs">
                Tworzenie atrakcyjnych opisów pracy i wymagań rekrutacyjnych
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-purple-500" />
                <span>Rozmowy Kwalifikacyjne</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-xs">
                Przygotowanie pytań i strategii prowadzenia rozmów z kandydatami
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <span>Optymalizacja HR</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-xs">
                Analiza procesów, KPI rekrutacyjne i strategie pozyskiwania talentów
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Interface */}
        <div className="h-[calc(100vh-280px)]">
          <AIAssistantWidget />
        </div>
      </main>
    </div>
  )
}