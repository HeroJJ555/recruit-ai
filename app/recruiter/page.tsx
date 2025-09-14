import { Sidebar } from "@/components/recruiter/sidebar"
import { DashboardStats } from "@/components/recruiter/dashboard-stats"
import { AIAssistantWidget } from "@/components/recruiter/ai-assistant-widget"
import { CandidateList } from "@/components/recruiter/candidate-list"
import { RecentActivity } from "@/components/recruiter/recent-activity"
import { Button } from "@/components/ui/button"
import { Plus, Bell } from "lucide-react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function RecruiterDashboard() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/auth/signin")
  }
  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 flex-shrink-0" />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-2xl">Dashboard</h1>
              <p className="text-muted-foreground">
                Witaj ponownie{session.user?.name ? `, ${session.user.name}` : ""}! Oto przegląd Twoich procesów rekrutacyjnych.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Powiadomienia
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nowa oferta pracy
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Stats */}
            <DashboardStats />

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                <CandidateList />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <AIAssistantWidget />
                <RecentActivity />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}