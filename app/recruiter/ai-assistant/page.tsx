import { Sidebar } from "@/components/recruiter/sidebar"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { AIAssistantFullscreen } from "@/components/recruiter/ai-assistant-fullscreen"

export default async function AIAssistantPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/signin")
  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 flex-shrink-0" />
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-2xl leading-tight">Asystent AI</h1>
            <p className="text-muted-foreground text-sm">Rozmawiaj z asystentem aby przyspieszyć proces rekrutacji.</p>
          </div>
        </header>
        <AIAssistantFullscreen />
      </main>
    </div>
  )
}