import { Sidebar } from "@/components/recruiter/sidebar"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileDown, Mail, Phone, Briefcase, Award, GraduationCap, FileText, Calendar, MessageCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CvAnalysis } from "@/components/recruiter/cv-analysis"
import { CandidateActionModalTrigger } from "@/components/recruiter/candidate-action-modal-trigger"

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
        status: true,
        cvFileName: true,
        createdAt: true,
        updatedAt: true,
      }
    })
  }
  if (!candidate) return notFound()

  const name = `${candidate.firstName} ${candidate.lastName}`
  const skills = candidate.skills ? String(candidate.skills).split(',').map(s => s.trim()).filter(Boolean) : []
  const cap = (s?: string) => s ? s.slice(0,1).toUpperCase() + s.slice(1) : s

  const statusToBadge = (s?: string) => {
    const v = String(s || '').toUpperCase()
    const base = 'px-2 py-0.5 rounded-full text-xs font-medium border inline-flex items-center gap-1'
    switch (v) {
      case 'PENDING': return <span className={`${base} bg-amber-50 text-amber-700 border-amber-200`}>Nowe</span>
      case 'WAITING': return <span className={`${base} bg-gray-50 text-gray-700 border-gray-200`}>Oczekuje</span>
      case 'REVIEWED': return <span className={`${base} bg-blue-50 text-blue-700 border-blue-200`}>Przejrzane</span>
      case 'CONTACTED': return <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200`}><MessageCircle className="h-3.5 w-3.5"/> Skontaktowano</span>
      case 'INTERVIEW': return <span className={`${base} bg-indigo-50 text-indigo-700 border-indigo-200`}>Rozmowa</span>
      case 'INTERVIEW_SCHEDULED': return <span className={`${base} bg-indigo-50 text-indigo-700 border-indigo-200`}>Zaplanowano rozmowę</span>
      case 'INTERVIEW_COMPLETED': return <span className={`${base} bg-violet-50 text-violet-700 border-violet-200`}>Rozmowa zakończona</span>
      case 'HIRED': return <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200`}>Zatrudniony</span>
      case 'REJECTED': return <span className={`${base} bg-rose-50 text-rose-700 border-rose-200`}>Odrzucony</span>
      case 'WITHDRAWN': return <span className={`${base} bg-zinc-50 text-zinc-700 border-zinc-200`}>Wycofany</span>
      default: return <span className={`${base} bg-gray-50 text-gray-700 border-gray-200`}>{s || 'Status'}</span>
    }
  }

  const formatFileSize = (n?: number | null) => {
    if (!n || n <= 0) return "-"
    if (n < 1024) return `${n} B`
    if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`
    return `${(n / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 flex-shrink-0" />
      <main className="flex-1 overflow-auto p-6 space-y-6 max-w-5xl">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-heading font-bold text-2xl">{name}</h1>
                {statusToBadge(candidate.status)}
              </div>
              <p className="text-muted-foreground text-sm">Szczegóły zgłoszenia kandydata</p>
            </div>
            <div className="flex items-center gap-2">
              {candidate.cvFileName ? (
                <Link href={`/api/candidate/applications/${candidate.id}/cv`} prefetch={false}>
                  <Button size="sm" variant="secondary">
                    <FileDown className="h-4 w-4 mr-2" /> Pobierz CV
                  </Button>
                </Link>
              ) : null}
              {/* Candidate-level actions as popup modal */}
              <CandidateActionModalTrigger candidateId={candidate.id} candidateName={name} />
              <Link href="/recruiter">
                <Button size="sm" variant="outline">Wróć</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <CvAnalysis appId={candidate.id} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-muted">
                <CardHeader>
                  <CardTitle className="text-base">Kontakt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span>{candidate.email}</span></div>
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span>{candidate.phone || '-'}</span></div>
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span>{new Date(candidate.createdAt).toLocaleString('pl-PL')}</span></div>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <span>Ostatnia aktualizacja statusu:</span>
                    <span>{new Date(candidate.updatedAt).toLocaleString('pl-PL')}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-muted">
                <CardHeader>
                  <CardTitle className="text-base">Profil zawodowy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" /><span>{candidate.position || '-'}</span></div>
                  <div className="flex items-center gap-2"><Award className="h-4 w-4 text-muted-foreground" /><Badge variant="secondary">{cap(candidate.experience)}</Badge></div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 border-muted">
                <CardHeader>
                  <CardTitle className="text-base">Umiejętności</CardTitle>
                </CardHeader>
                <CardContent>
                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skills.map(s => (
                        <Badge key={s} variant="outline">{s}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Brak zdefiniowanych umiejętności</p>
                  )}
                </CardContent>
              </Card>

              {candidate.education ? (
                <Card className="border-muted">
                  <CardHeader>
                    <CardTitle className="text-base">Wykształcenie</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm flex items-start gap-2">
                    <GraduationCap className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span>{candidate.education}</span>
                  </CardContent>
                </Card>
              ) : null}

              <Card className="border-muted">
                <CardHeader>
                  <CardTitle className="text-base">CV</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  {candidate.cvFileName ? (
                    <>
                      <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><span className="truncate" title={candidate.cvFileName}>{candidate.cvFileName}</span></div>
                      <Link href={`/api/candidate/applications/${candidate.id}/cv`} prefetch={false}>
                        <Button size="sm" variant="secondary"><FileDown className="h-4 w-4 mr-2" /> Pobierz</Button>
                      </Link>
                    </>
                  ) : (
                    <p className="text-muted-foreground">Brak załączonego CV</p>
                  )}
                </CardContent>
              </Card>

              {/* Prosta oś czasu statusu */}
              <Card className="md:col-span-2 border-muted">
                <CardHeader>
                  <CardTitle className="text-base">Historia statusu</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="relative border-s border-muted-foreground/20 ml-3 space-y-4">
                    <li className="ms-4">
                      <div className="absolute w-2 h-2 bg-muted-foreground/40 rounded-full -start-1 mt-2" />
                      <time className="block text-xs text-muted-foreground">{new Date(candidate.createdAt).toLocaleString('pl-PL')}</time>
                      <p className="text-sm">Zgłoszenie utworzone</p>
                    </li>
                    <li className="ms-4">
                      <div className="absolute w-2 h-2 bg-emerald-500 rounded-full -start-1 mt-2" />
                      <time className="block text-xs text-muted-foreground">{new Date(candidate.updatedAt).toLocaleString('pl-PL')}</time>
                      <div className="text-sm flex items-center gap-2">Aktualny status: {statusToBadge(candidate.status)}</div>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
