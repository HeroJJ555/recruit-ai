import { Sidebar } from "@/components/recruiter/sidebar"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ClientSettingsTabs from "./settingsTabs"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/signin')
  // Always fetch the freshest user profile from DB so updates (name/image) show immediately after router.refresh
  let dbUser = null
  if (session.user?.email) {
    try {
      dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { name: true, email: true, image: true }
      })
    } catch {
      // swallow – fall back to session values
    }
  }
  const user = {
    name: dbUser?.name ?? session.user?.name ?? '',
    email: dbUser?.email ?? session.user?.email ?? '',
    image: dbUser?.image ?? (session.user as any)?.image ?? ''
  }
  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 flex-shrink-0" />
      <main className="flex-1 overflow-auto p-6 space-y-6 max-w-5xl">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-2xl leading-tight">Ustawienia</h1>
            <p className="text-muted-foreground text-sm">Zarządzaj profilem, preferencjami AI i powiadomieniami.</p>
          </div>
        </header>
        <ClientSettingsTabs user={user} />
      </main>
    </div>
  )
}