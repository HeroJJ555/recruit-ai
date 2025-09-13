import { Sidebar } from "@/components/recruiter/sidebar"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Eye, FileDown } from "lucide-react"
import Link from "next/link"

function fmtDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short" }).format(date)
}

export default async function RecruiterCandidatesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/signin")

  const applications = await prisma.candidateApplication.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      position: true,
      experience: true,
      createdAt: true,
      cvFileName: true,
    },
  })

  type AppRow = typeof applications[number]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 flex-shrink-0" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-2xl leading-tight">Kandydaci</h1>
              <p className="text-muted-foreground text-sm">Lista najnowszych zgłoszeń kandydatów</p>
            </div>
            <div className="flex items-center gap-3" />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Zgłoszenia</CardTitle>
              <CardDescription>Ostatnie 50 aplikacji</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Imię i nazwisko</TableHead>
                      <TableHead>Stanowisko</TableHead>
                      <TableHead>Doświadczenie</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Akcje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((a: AppRow) => (  
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.firstName} {a.lastName}</TableCell>
                        <TableCell>{a.position}</TableCell>
                        <TableCell className="capitalize">{a.experience}</TableCell>
                        <TableCell>{a.email}</TableCell>
                        <TableCell>{fmtDate(a.createdAt)}</TableCell>
                        <TableCell className="text-left">
                          <div className="flex items-left justify-start gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/recruiter/candidates/${a.id}`} prefetch={false} aria-label="Profil">
                                  <Button size="icon" variant="secondary" className="rounded-full">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>Profil</TooltipContent>
                            </Tooltip>
                            {a.cvFileName ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link href={`/api/candidate/applications/${a.id}/cv`} prefetch={false} aria-label="Pobierz CV">
                                    <Button size="icon" variant="secondary" className="rounded-full">
                                      <FileDown className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent>Pobierz CV</TooltipContent>
                              </Tooltip>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="icon" variant="outline" className="rounded-full" disabled aria-label="Brak CV">
                                    <FileDown className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Brak CV</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {applications.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Brak zgłoszeń
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
