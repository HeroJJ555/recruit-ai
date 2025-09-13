import { Sidebar } from "@/components/recruiter/sidebar"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default async function SearchPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/signin")
  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 flex-shrink-0" />
      <main className="flex-1 overflow-auto p-6 space-y-6 max-w-4xl">
        <div>
          <h1 className="font-heading font-bold text-2xl mb-1">Wyszukiwanie</h1>
          <p className="text-muted-foreground text-sm">Znajdź kandydatów według słów kluczowych lub umiejętności.</p>
        </div>
        <form className="flex gap-2">
          <Input placeholder="np. React, Java, Marketing" />
          <Button type="submit">Szukaj</Button>
        </form>
        <div className="border rounded-lg p-8 text-center text-muted-foreground text-sm">(TODO) Wyniki wyszukiwania.</div>
      </main>
    </div>
  )
}
