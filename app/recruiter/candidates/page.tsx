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

  const applications = await prisma.candidateApplication.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      position: true,
      experience: true,
      createdAt: true,
      cvFileName: true,
    },
  })

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
        <main className="flex-1 overflow-auto p-6">
          <CandidatesTable items={applications as any} />
        </main>
      </div>
    </div>
  )
}
