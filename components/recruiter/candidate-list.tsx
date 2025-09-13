import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, MapPin, Calendar, Eye } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"

export async function CandidateList() {
  // Fetch newest candidate applications
  let candidates: any[] = []
  // If Prisma client has the model generated, query it. Otherwise fall back to empty list.
  if ((prisma as any).candidateApplication?.findMany) {
    try {
      candidates = await (prisma as any).candidateApplication.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    } catch (e: any) {
      // Graceful degradation if schema not migrated (e.g., missing jobId column)
      console.error("CandidateList query error:", e?.message)
      candidates = []
    }
  }
  const getScoreColor = (score: number | null | undefined) => {
    if ((score ?? 0) >= 90) return "text-green-600"
    if ((score ?? 0) >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusColor = (status: string | null | undefined) => {
    switch (status) {
      case "Nowy":
        return "bg-blue-100 text-blue-800"
      case "W trakcie":
        return "bg-yellow-100 text-yellow-800"
      case "Rozmowa":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Najnowsi kandydaci</CardTitle>
        <CardDescription>Ostatnio przesłane wnioski kandydatów</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {candidates.map((candidate: any) => {
            const name = `${candidate.firstName ?? ""} ${candidate.lastName ?? ""}`.trim()
            const skills = candidate.skills ? (candidate.skills as string).split(",").map((s: string) => s.trim()).filter(Boolean) : []
            const appliedDate = candidate.createdAt ? formatDistanceToNow(new Date(candidate.createdAt), { addSuffix: true, locale: pl }) : "-"

            return (
              <div
                key={candidate.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>
                      {name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{name || "Brak imienia"}</h4>
                      <Badge variant="secondary" className={getStatusColor(undefined)}>
                        {"Nowy"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{candidate.position ?? "-"}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{candidate.email ?? "-"}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{appliedDate}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {skills.slice(0, 3).map((skill: string) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className={`font-semibold ${getScoreColor(undefined)}`}>{"-"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Dopasowanie AI</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Zobacz profil
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}