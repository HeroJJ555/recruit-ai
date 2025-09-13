import { Sidebar } from "@/components/recruiter/sidebar"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function JobsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/signin")
  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 flex-shrink-0" />
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-2xl mb-1">Oferty pracy</h1>
            <p className="text-muted-foreground text-sm">Zarządzaj aktywnymi ofertami i dodawaj nowe.</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nowa oferta
          </Button>
        </div>
        <div className="border rounded-lg p-8 text-center text-sm text-muted-foreground">
          (TODO) Tutaj pojawi się lista ofert pracy.
        </div>
      </main>
    </div>
  )
}
