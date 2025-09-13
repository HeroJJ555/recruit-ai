"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Clock, DollarSign, Building, Heart, ExternalLink, Search, Filter } from "lucide-react"

export function JobRecommendations() {
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [experienceFilter, setExperienceFilter] = useState("")

  // Mock job data - in real app this would come from API
  const jobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp",
      location: "Warszawa",
      salary: "12,000 - 18,000 PLN",
      type: "Pełny etat",
      remote: true,
      posted: "2 dni temu",
      match: 95,
      skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
      description: "Szukamy doświadczonego Frontend Developera do pracy nad nowoczesnymi aplikacjami web...",
    },
    {
      id: 2,
      title: "React Developer",
      company: "StartupXYZ",
      location: "Kraków",
      salary: "8,000 - 14,000 PLN",
      type: "Pełny etat",
      remote: false,
      posted: "1 dzień temu",
      match: 88,
      skills: ["React", "JavaScript", "Node.js", "MongoDB"],
      description: "Dołącz do naszego dynamicznego zespołu i twórz innowacyjne rozwiązania...",
    },
    {
      id: 3,
      title: "Full Stack Developer",
      company: "FinTech Solutions",
      location: "Praca zdalna",
      salary: "10,000 - 16,000 PLN",
      type: "Kontrakt B2B",
      remote: true,
      posted: "3 dni temu",
      match: 82,
      skills: ["React", "Node.js", "PostgreSQL", "AWS"],
      description: "Poszukujemy Full Stack Developera do pracy nad platformą finansową...",
    },
  ]

  const handleApply = async (jobId: number) => {
    // TODO: Integrate with job application API
    console.log("[v0] Applying to job:", jobId)
    alert("Aplikacja została wysłana!")
  }

  const handleSaveJob = async (jobId: number) => {
    // TODO: Integrate with saved jobs API
    console.log("[v0] Saving job:", jobId)
    alert("Oferta została zapisana!")
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-heading">Rekomendowane oferty pracy</CardTitle>
          <CardDescription>
            Nasze AI znalazło {jobs.length} ofert idealnie dopasowanych do Twojego profilu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Szukaj ofert pracy..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Lokalizacja" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="warszawa">Warszawa</SelectItem>
                <SelectItem value="krakow">Kraków</SelectItem>
                <SelectItem value="remote">Praca zdalna</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={setExperienceFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Doświadczenie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="junior">Junior</SelectItem>
                <SelectItem value="mid">Mid</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="bg-transparent">
              <Filter className="h-4 w-4 mr-2" />
              Więcej filtrów
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Job Listings */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id} className="border-border hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-heading font-semibold text-foreground mb-1">{job.title}</h3>
                      <div className="flex items-center space-x-4 text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Building className="h-4 w-4" />
                          <span>{job.company}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{job.posted}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {job.match}% dopasowanie
                      </Badge>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-4 line-clamp-2">{job.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{job.salary}</span>
                    </div>
                    <span>{job.type}</span>
                    {job.remote && <Badge variant="secondary">Praca zdalna</Badge>}
                  </div>
                </div>

                <div className="flex flex-col space-y-2 lg:w-48">
                  <Button onClick={() => handleApply(job.id)} className="w-full">
                    Aplikuj teraz
                  </Button>
                  <Button variant="outline" onClick={() => handleSaveJob(job.id)} className="w-full bg-transparent">
                    <Heart className="h-4 w-4 mr-2" />
                    Zapisz
                  </Button>
                  <Button variant="ghost" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Zobacz więcej
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" size="lg" className="bg-transparent">
          Załaduj więcej ofert
        </Button>
      </div>
    </div>
  )
}
