import { type NextRequest, NextResponse } from "next/server"

// GET /api/jobs - Get job postings
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check
    // TODO: Connect to Supabase database

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const location = searchParams.get("location") || ""
    const experience = searchParams.get("experience") || ""
    const remote = searchParams.get("remote") === "true"
    const candidateId = searchParams.get("candidateId") // For personalized recommendations

    // Mock job data - replace with actual database query
    const mockJobs = [
      {
        id: "1",
        title: "Senior Frontend Developer",
        company: "TechCorp",
        location: "Warszawa",
        salary: "12,000 - 18,000 PLN",
        employmentType: "Pełny etat",
        isRemote: true,
        experienceLevel: "senior",
        skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
        description: "Poszukujemy doświadczonego Frontend Developera do pracy nad nowoczesnymi aplikacjami web...",
        requirements: "Minimum 5 lat doświadczenia w React, TypeScript, znajomość Next.js",
        responsibilities: "Rozwój aplikacji frontend, współpraca z zespołem backend, code review",
        postedAt: "2024-01-13T10:00:00Z",
        expiresAt: "2024-02-13T10:00:00Z",
        isActive: true,
        aiMatchScore: candidateId ? 95 : undefined,
      },
      {
        id: "2",
        title: "React Developer",
        company: "StartupXYZ",
        location: "Kraków",
        salary: "8,000 - 14,000 PLN",
        employmentType: "Pełny etat",
        isRemote: false,
        experienceLevel: "mid",
        skills: ["React", "JavaScript", "Node.js", "MongoDB"],
        description: "Dołącz do naszego dynamicznego zespołu i twórz innowacyjne rozwiązania...",
        requirements: "Minimum 2 lata doświadczenia w React, znajomość JavaScript ES6+",
        responsibilities: "Rozwój komponentów React, integracja z API, testowanie",
        postedAt: "2024-01-14T14:30:00Z",
        expiresAt: "2024-02-14T14:30:00Z",
        isActive: true,
        aiMatchScore: candidateId ? 88 : undefined,
      },
      {
        id: "3",
        title: "Full Stack Developer",
        company: "FinTech Solutions",
        location: "Praca zdalna",
        salary: "10,000 - 16,000 PLN",
        employmentType: "Kontrakt B2B",
        isRemote: true,
        experienceLevel: "mid",
        skills: ["React", "Node.js", "PostgreSQL", "AWS"],
        description: "Poszukujemy Full Stack Developera do pracy nad platformą finansową...",
        requirements: "Doświadczenie w React i Node.js, znajomość baz danych",
        responsibilities: "Rozwój full-stack aplikacji, projektowanie API, optymalizacja",
        postedAt: "2024-01-12T09:15:00Z",
        expiresAt: "2024-02-12T09:15:00Z",
        isActive: true,
        aiMatchScore: candidateId ? 82 : undefined,
      },
    ]

    // Apply filters
    let filteredJobs = mockJobs.filter((job) => job.isActive)

    if (search) {
      filteredJobs = filteredJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(search.toLowerCase()) ||
          job.company.toLowerCase().includes(search.toLowerCase()) ||
          job.skills.some((skill) => skill.toLowerCase().includes(search.toLowerCase())),
      )
    }

    if (location && location !== "all") {
      filteredJobs = filteredJobs.filter((job) => job.location.toLowerCase().includes(location.toLowerCase()))
    }

    if (experience && experience !== "all") {
      filteredJobs = filteredJobs.filter((job) => job.experienceLevel === experience)
    }

    if (remote) {
      filteredJobs = filteredJobs.filter((job) => job.isRemote)
    }

    // Sort by AI match score if candidateId provided (personalized recommendations)
    if (candidateId) {
      filteredJobs.sort((a, b) => (b.aiMatchScore || 0) - (a.aiMatchScore || 0))
    } else {
      // Sort by posted date (newest first)
      filteredJobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex)

    return NextResponse.json({
      jobs: paginatedJobs,
      pagination: {
        page,
        limit,
        total: filteredJobs.length,
        totalPages: Math.ceil(filteredJobs.length / limit),
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching jobs:", error)
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}

// POST /api/jobs - Create new job posting (for recruiters)
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check for recruiters
    // TODO: Connect to Supabase database

    const body = await request.json()
    const {
      title,
      description,
      requirements,
      responsibilities,
      location,
      salaryMin,
      salaryMax,
      employmentType,
      experienceLevel,
      skills,
      isRemote,
      expiresAt,
    } = body

    // Validate required fields
    if (!title || !description || !location || !employmentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // TODO: Insert into database
    const newJob = {
      id: Date.now().toString(), // In real app, this would be generated by database
      title,
      description,
      requirements,
      responsibilities,
      location,
      salaryMin,
      salaryMax,
      employmentType,
      experienceLevel,
      skills: skills || [],
      isRemote: isRemote || false,
      isActive: true,
      postedAt: new Date().toISOString(),
      expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    }

    console.log("[v0] Creating new job posting:", newJob)

    return NextResponse.json({ job: newJob, message: "Job posting created successfully" }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating job:", error)
    return NextResponse.json({ error: "Failed to create job posting" }, { status: 500 })
  }
}
