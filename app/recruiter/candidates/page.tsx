import { Sidebar } from "@/components/recruiter/sidebar"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CandidatesTable } from "@/components/recruiter/candidates-table"

function fmtDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short" }).format(date)
}

export default async function RecruiterCandidatesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/signin")

  const applications = await prisma.candidateApplication.findMany(({ 
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      position: true,
      experience: true,
      status: true,
      createdAt: true,
      cvFileName: true,
    },
  } as any))

  const activeStatuses = ['PENDING', 'IN_REVIEW', 'INTERVIEW_SCHEDULED']
  const archivedStatuses = ['HIRED', 'REJECTED', 'WITHDRAWN']
  
  const active = applications.filter(app => activeStatuses.includes(app.status))
  const archived = applications.filter(app => archivedStatuses.includes(app.status))

  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 flex-shrink-0" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-2xl leading-tight">Kandydaci</h1>
              <p className="text-muted-foreground text-sm">Lista najnowszych zgłoszeń kandydatów</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 space-y-10">
          <section>
            <h2 className="font-semibold text-lg mb-4">Nowe zgłoszenia</h2>
            <p className="text-sm text-muted-foreground mb-2">Aplikacje oczekujące na decyzję / feedback</p>
            <CandidatesTable items={active as any} />
          </section>
          <section>
            <h2 className="font-semibold text-lg mb-4">Archiwum</h2>
            <p className="text-sm text-muted-foreground mb-2">Aplikacje już rozpatrzone (feedback wysłany, odrzucone, zatrudnione itp.) — ukryte z głównego widoku</p>
            <CandidatesTable items={archived as any} />
          </section>
        </main>
      </div>
    </div>
  )
}
