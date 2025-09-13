import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, MapPin, Calendar, Eye } from "lucide-react"

const candidates = [
  {
    id: 1,
    name: "Jan Nowak",
    position: "Frontend Developer",
    location: "Warszawa",
    experience: "5 lat",
    skills: ["React", "TypeScript", "Next.js"],
    aiScore: 95,
    appliedDate: "2 dni temu",
    status: "Nowy",
  },
  {
    id: 2,
    name: "Maria Kowalczyk",
    position: "UX Designer",
    location: "Kraków",
    experience: "3 lata",
    skills: ["Figma", "Adobe XD", "Prototyping"],
    aiScore: 88,
    appliedDate: "1 dzień temu",
    status: "W trakcie",
  },
  {
    id: 3,
    name: "Piotr Wiśniewski",
    position: "Backend Developer",
    location: "Gdańsk",
    experience: "7 lat",
    skills: ["Node.js", "Python", "PostgreSQL"],
    aiScore: 92,
    appliedDate: "3 dni temu",
    status: "Rozmowa",
  },
]

export function CandidateList() {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusColor = (status: string) => {
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
        <CardDescription>Kandydaci z najwyższym dopasowaniem AI</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {candidate.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold">{candidate.name}</h4>
                    <Badge variant="secondary" className={getStatusColor(candidate.status)}>
                      {candidate.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{candidate.position}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{candidate.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{candidate.appliedDate}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {candidate.skills.slice(0, 3).map((skill) => (
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
                    <span className={`font-semibold ${getScoreColor(candidate.aiScore)}`}>{candidate.aiScore}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Dopasowanie AI</p>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Zobacz profil
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
