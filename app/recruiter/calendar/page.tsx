import { Sidebar } from "@/components/recruiter/sidebar"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { CalendarPageClient } from "@/components/recruiter/calendar-page-client"

export default async function CalendarPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/signin")
  
  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 flex-shrink-0" />
      <main className="flex-1 overflow-auto p-6">
        <CalendarPageClient />
      </main>
    </div>
  )
}
