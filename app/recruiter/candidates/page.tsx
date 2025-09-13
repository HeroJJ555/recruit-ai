import { Sidebar } from "@/components/recruiter/sidebar"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { CandidateList } from "@/components/recruiter/candidate-list"

export default async function CandidatesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/signin")
  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 flex-shrink-0" />
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div>
          <h1 className="font-heading font-bold text-2xl mb-1">Kandydaci</h1>
          <p className="text-muted-foreground text-sm">Lista najnowszych zgłoszeń kandydatów.</p>
        </div>
        <CandidateList />
      </main>
    </div>
  )
}
