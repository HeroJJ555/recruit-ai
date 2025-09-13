import { Sidebar } from "@/components/recruiter/sidebar"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/signin")
  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 flex-shrink-0" />
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div>
          <h1 className="font-heading font-bold text-2xl mb-1">Analityka</h1>
          <p className="text-muted-foreground text-sm">Kluczowe wskaźniki wydajności procesów rekrutacyjnych.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="border rounded-lg p-4 h-40 flex items-center justify-center text-muted-foreground text-sm">(TODO) Wykres 1</div>
          <div className="border rounded-lg p-4 h-40 flex items-center justify-center text-muted-foreground text-sm">(TODO) Wykres 2</div>
          <div className="border rounded-lg p-4 h-40 flex items-center justify-center text-muted-foreground text-sm">(TODO) Wykres 3</div>
        </div>
      </main>
    </div>
  )
}
