import { Sidebar } from "@/components/recruiter/sidebar"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"

interface CandidateDetailPageProps { params: { id: string } }

export default async function CandidateDetailPage({ params }: CandidateDetailPageProps) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/signin")

  let candidate: any | null = null
  if ((prisma as any).candidateApplication?.findUnique) {
    candidate = await (prisma as any).candidateApplication.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        position: true,
        experience: true,
        skills: true,
        education: true,
        cvFileName: true,
        createdAt: true,
      }
    })
  }
  if (!candidate) return notFound()

  const name = `${candidate.firstName} ${candidate.lastName}`

  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 flex-shrink-0" />
      <main className="flex-1 overflow-auto p-6 space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-2xl mb-1">{name}</h1>
            <p className="text-muted-foreground text-sm">Szczegóły zgłoszenia kandydata.</p>
          </div>
          <div className="flex items-center gap-2">
            {candidate.cvFileName ? (
              <Link href={`/api/candidate/applications/${candidate.id}/cv`} prefetch={false}>
                <Button size="sm" variant="secondary">
                  <FileDown className="h-4 w-4 mr-2" /> Pobierz CV
                </Button>
              </Link>
            ) : null}
            <Link href="/recruiter">
              <Button size="sm" variant="outline">Wróć</Button>
            </Link>
          </div>
        </div>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-2">Podstawowe dane</h2>
            <ul className="text-sm space-y-1">
              <li><strong>Email:</strong> {candidate.email}</li>
              <li><strong>Telefon:</strong> {candidate.phone || '-'} </li>
              <li><strong>Pozycja:</strong> {candidate.position}</li>
              <li><strong>Doświadczenie:</strong> {candidate.experience}</li>
              <li><strong>Umiejętności:</strong> {candidate.skills}</li>
              <li><strong>Edukacja:</strong> {candidate.education || '-'}</li>
              <li><strong>Utworzono:</strong> {new Date(candidate.createdAt).toLocaleString('pl-PL')}</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4 text-sm text-muted-foreground">(TODO) Podgląd CV / analiza AI.</div>
        </div>
      </main>
    </div>
  )
}
