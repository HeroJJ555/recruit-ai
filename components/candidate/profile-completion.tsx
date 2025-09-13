"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { User, MapPin, Briefcase, GraduationCap, Award, CheckCircle } from "lucide-react"

export function ProfileCompletion() {
  const [profile, setProfile] = useState({
    location: "",
    bio: "",
    experience: "",
    salary: "",
    availability: "",
    languages: "",
    certifications: "",
  })

  const completionPercentage = 65 // This would be calculated based on filled fields

  const handleSave = async () => {
    // TODO: Integrate with profile API
    console.log("[v0] Profile data to save:", profile)
    alert("Profil został zaktualizowany!")
  }

  const profileSections = [
    { icon: User, title: "Dane podstawowe", completed: true },
    { icon: MapPin, title: "Lokalizacja", completed: true },
    { icon: Briefcase, title: "Doświadczenie", completed: false },
    { icon: GraduationCap, title: "Wykształcenie", completed: true },
    { icon: Award, title: "Certyfikaty", completed: false },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Completion Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-heading">Uzupełnij swój profil</CardTitle>
              <CardDescription>
                Kompletny profil zwiększa Twoje szanse na znalezienie idealnej pracy o 3x
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{completionPercentage}%</div>
              <div className="text-sm text-muted-foreground">ukończone</div>
            </div>
          </div>
          <Progress value={completionPercentage} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Profile Sections Overview */}
      <div className="grid md:grid-cols-5 gap-4">
        {profileSections.map((section, index) => (
          <Card
            key={index}
            className={`border ${section.completed ? "border-green-200 bg-green-50/50" : "border-border"}`}
          >
            <CardContent className="p-4 text-center">
              <div className={`rounded-full p-2 w-fit mx-auto mb-2 ${section.completed ? "bg-green-100" : "bg-muted"}`}>
                <section.icon className={`h-5 w-5 ${section.completed ? "text-green-600" : "text-muted-foreground"}`} />
              </div>
              <div className="text-sm font-medium">{section.title}</div>
              {section.completed && <CheckCircle className="h-4 w-4 text-green-600 mx-auto mt-1" />}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Profile Form */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Lokalizacja i dostępność</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Preferowana lokalizacja</Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => setProfile((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="np. Warszawa, Kraków, praca zdalna"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability">Dostępność</Label>
              <Select onValueChange={(value) => setProfile((prev) => ({ ...prev, availability: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Kiedy możesz rozpocząć pracę?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediately">Natychmiast</SelectItem>
                  <SelectItem value="2weeks">Za 2 tygodnie</SelectItem>
                  <SelectItem value="1month">Za miesiąc</SelectItem>
                  <SelectItem value="3months">Za 3 miesiące</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Oczekiwania finansowe (brutto/mies.)</Label>
              <Input
                id="salary"
                value={profile.salary}
                onChange={(e) => setProfile((prev) => ({ ...prev, salary: e.target.value }))}
                placeholder="np. 8000-12000 PLN"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>O mnie</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Krótki opis</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Opisz siebie w kilku zdaniach..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="languages">Języki obce</Label>
              <Input
                id="languages"
                value={profile.languages}
                onChange={(e) => setProfile((prev) => ({ ...prev, languages: e.target.value }))}
                placeholder="np. Angielski (C1), Niemiecki (B2)"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Certyfikaty i kursy</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="certifications">Certyfikaty</Label>
              <Textarea
                id="certifications"
                value={profile.certifications}
                onChange={(e) => setProfile((prev) => ({ ...prev, certifications: e.target.value }))}
                placeholder="Wymień swoje certyfikaty, kursy i szkolenia..."
                rows={4}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">AWS Certified</Badge>
              <Badge variant="secondary">Google Analytics</Badge>
              <Badge variant="secondary">Scrum Master</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
            <CardDescription>Sugestie AI do poprawy profilu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="bg-blue-100 rounded-full p-1">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-sm">
                  <div className="font-medium">Dodaj portfolio</div>
                  <div className="text-muted-foreground">Link do GitHub lub portfolio zwiększy Twoje szanse o 40%</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="bg-yellow-100 rounded-full p-1">
                  <CheckCircle className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="text-sm">
                  <div className="font-medium">Uzupełnij umiejętności</div>
                  <div className="text-muted-foreground">
                    Dodaj więcej szczegółów o swoich kompetencjach technicznych
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          Zapisz profil
        </Button>
      </div>
    </div>
  )
}
