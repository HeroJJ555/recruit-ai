import { Sidebar } from "@/components/recruiter/sidebar"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function MessagesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/signin")
  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 flex-shrink-0" />
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-2xl leading-tight">Wiadomości</h1>
            <p className="text-muted-foreground text-sm">(TODO) Moduł komunikacji z kandydatami.</p>
          </div>
          <div className="flex items-center gap-3" />
        </header>
        <div className="border rounded-lg p-8 text-center text-muted-foreground text-sm">Tutaj pojawi się skrzynka odbiorcza.</div>
      </main>
    </div>
  )
}
