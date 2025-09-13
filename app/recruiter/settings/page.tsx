import { Sidebar } from "@/components/recruiter/sidebar"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/signin")
  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 flex-shrink-0" />
      <main className="flex-1 overflow-auto p-6 space-y-6 max-w-3xl">
        <div>
          <h1 className="font-heading font-bold text-2xl mb-1">Ustawienia</h1>
          <p className="text-muted-foreground text-sm">Konfiguracja konta i preferencje rekrutera.</p>
        </div>
        <form className="space-y-4">
          <div>
            <label className="block text-sm mb-1 font-medium">Nazwa organizacji</label>
            <Input defaultValue="Moja Firma" />
          </div>
          <div>
            <label className="block text-sm mb-1 font-medium">Email powiadomień</label>
            <Input defaultValue={session.user?.email ?? ""} type="email" />
          </div>
          <Button type="submit">Zapisz</Button>
        </form>
      </main>
    </div>
  )
}
