import { NextRequest, NextResponse } from "next/server"
import { Buffer } from "buffer"
import { prisma } from "@/lib/prisma"
import { revalidateTag } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { enqueueCandidateAnalysis } from "@/lib/analysis-queue"

// GET /api/candidate/applications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only select necessary fields to improve performance
    const applications = await prisma.candidateApplication.findMany({
      select: ({
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        position: true,
        experience: true,
        skills: true,
        cvFileName: true,
        status: true,
        createdAt: true,
        cvAnalysis: {
          select: {
            matchScore: true,
            aiProvider: true,
            createdAt: true
          }
        } as any
      }) as any,
      orderBy: { createdAt: "desc" },
      take: 50, // Limit results for better performance
    })

    return NextResponse.json({ 
      items: applications,
      count: applications.length 
    })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    )
  }
}

// POST /api/candidate/applications
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || ""

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData()
      
      // Extract fields
      const firstName = String(form.get("firstName") || "").trim()
      const lastName = String(form.get("lastName") || "").trim()
      const email = String(form.get("email") || "").trim().toLowerCase()
      const phone = String(form.get("phone") || "").trim() || null
      const position = String(form.get("position") || "").trim()
      const experience = String(form.get("experience") || "").trim()
      const skills = String(form.get("skills") || "").trim()
      const education = String(form.get("education") || "").trim() || null
      const cv = form.get("cv") as File | null

      // === WALIDACJA PRZED KONTYNUOWANIEM ===
      const errors: string[] = []
      
      // Sprawdzenie wymaganych pól
      if (!firstName) errors.push("Imię jest wymagane")
      if (!lastName) errors.push("Nazwisko jest wymagane")
      if (!email) errors.push("Email jest wymagany")
      if (!position) errors.push("Stanowisko jest wymagane")
      if (!experience) errors.push("Doświadczenie jest wymagane")
      if (!skills) errors.push("Umiejętności są wymagane")
      
      // Sprawdzenie formatu email
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push("Nieprawidłowy format email")
      }
      
      // Sprawdzenie doświadczenia
      const validExperience = ["junior", "mid", "senior", "lead"]
      if (experience && !validExperience.includes(experience)) {
        errors.push("Nieprawidłowe doświadczenie (dozwolone: junior, mid, senior, lead)")
      }
      
      // Sprawdzenie długości pól
      if (firstName && firstName.length > 50) errors.push("Imię jest zbyt długie (max 50 znaków)")
      if (lastName && lastName.length > 50) errors.push("Nazwisko jest zbyt długie (max 50 znaków)")
      if (position && position.length > 100) errors.push("Stanowisko jest zbyt długie (max 100 znaków)")
      if (skills && skills.length > 500) errors.push("Umiejętności są zbyt długie (max 500 znaków)")
      if (education && education.length > 200) errors.push("Wykształcenie jest zbyt długie (max 200 znaków)")
      
      // Jeśli są błędy walidacji, STOP - nie kontynuuj
      if (errors.length > 0) {
        return NextResponse.json({ error: errors.join(", ") }, { status: 400 })
      }

      // === WALIDACJA PLIKU CV ===
      let cvFileName: string | null = null
      let cvFileType: string | null = null
      let cvFileSize: number | null = null
      
      if (cv) {
        const allowedTypes = [
          "application/pdf", 
          "application/msword", 
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ]
        
        // Sprawdzenie rozmiaru pliku
        if (cv.size > 10 * 1024 * 1024) {
          return NextResponse.json({ error: "Plik jest zbyt duży (max 10MB)" }, { status: 413 })
        }
        
        // Sprawdzenie typu pliku
        if (cv.type && !allowedTypes.includes(cv.type)) {
          return NextResponse.json({ error: "Niedozwolony format pliku (tylko PDF, DOC, DOCX)" }, { status: 400 })
        }
        
        // Sprawdzenie nazwy pliku
        if (!cv.name || cv.name.length === 0) {
          return NextResponse.json({ error: "Plik musi mieć nazwę" }, { status: 400 })
        }
        
        cvFileName = cv.name
        cvFileType = cv.type
        cvFileSize = cv.size
      }

      // === SPRAWDZENIE SESJI ===
      const session = await getServerSession(authOptions)
      // Sesja nie jest wymagana, ale jeśli istnieje, użyjemy userId

      // === TWORZENIE APLIKACJI (tylko podstawowe pola, bez storage) ===
      const applicationData: any = {
        userId: (session?.user as any)?.id ?? undefined,
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        position,
        experience,
        skills,
        education: education || undefined,
        // HOTFIX: DB has NOT NULL on cvFileData, provide empty bytea to satisfy constraint
        cvFileData: Buffer.from([]),
      }
      
      // Dodanie metadanych CV jeśli plik został przesłany
      if (cvFileName) {
        applicationData.cvFileName = cvFileName
        applicationData.cvFileType = cvFileType
        applicationData.cvFileSize = cvFileSize
      }
      
      // NOTE: Pomijamy storage fields (storageProvider, storageBucket, storageKey, fileHash) 
      // dopóki nie zastosujemy migracji bazy danych

      let created
      try {
        created = await prisma.candidateApplication.create({
          data: applicationData,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true,
            cvFileName: true,
            createdAt: true,
          }
        })
      } catch (err: any) {
        // If DB rejects due to NOT NULL on cvFileData, drop constraint and retry once
        if (err?.code === 'P2011') {
          try {
            await prisma.$executeRawUnsafe('ALTER TABLE "public"."CandidateApplication" ALTER COLUMN "cvFileData" DROP NOT NULL;')
            created = await prisma.candidateApplication.create({
              data: applicationData,
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                position: true,
                cvFileName: true,
                createdAt: true,
              }
            })
          } catch (innerErr) {
            throw innerErr
          }
        } else {
          throw err
        }
      }

      // Enqueue analysis FIFO
      try { enqueueCandidateAnalysis(created.id) } catch {}
      revalidateTag("candidates")

      return NextResponse.json({ 
        success: true, 
        data: created,
        message: "Aplikacja została przesłana pomyślnie (analiza w kolejce)" 
      })

    } else {
      // === JSON REQUEST HANDLING ===
      const body = await req.json()
      const { 
        firstName, 
        lastName, 
        email, 
        phone, 
        jobId, // New field for job selection
        position, // Keep for backward compatibility
        experience, 
        skills, 
        education,
        cvFileName,
        cvFileType,
        cvFileSize 
      } = body

      // === WALIDACJA PRZED KONTYNUOWANIEM ===
      const errors: string[] = []
      
      // Sprawdzenie wymaganych pól
      if (!firstName?.trim()) errors.push("Imię jest wymagane")
      if (!lastName?.trim()) errors.push("Nazwisko jest wymagane")
      if (!email?.trim()) errors.push("Email jest wymagane")
      if (!jobId?.trim() && !position?.trim()) errors.push("Oferta pracy lub stanowisko jest wymagane")
      if (!experience?.trim()) errors.push("Doświadczenie jest wymagane")
      if (!skills?.trim()) errors.push("Umiejętności są wymagane")
      
      // Sprawdzenie formatu email
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.push("Nieprawidłowy format email")
      }
      
      // Sprawdzenie doświadczenia
      const validExperience = ["junior", "mid", "senior", "lead"]
      if (experience && !validExperience.includes(experience.trim())) {
        errors.push("Nieprawidłowe doświadczenie (dozwolone: junior, mid, senior, lead)")
      }
      
      // Sprawdzenie długości pól
      if (firstName && firstName.trim().length > 50) errors.push("Imię jest zbyt długie (max 50 znaków)")
      if (lastName && lastName.trim().length > 50) errors.push("Nazwisko jest zbyt długie (max 50 znaków)")
      if (position && position.trim().length > 100) errors.push("Stanowisko jest zbyt długie (max 100 znaków)")
      if (skills && skills.trim().length > 500) errors.push("Umiejętności są zbyt długie (max 500 znaków)")
      if (education && education.trim().length > 200) errors.push("Wykształcenie jest zbyt długie (max 200 znaków)")
      
      // Walidacja metadanych CV
      if (cvFileSize && (typeof cvFileSize !== 'number' || cvFileSize <= 0)) {
        errors.push("Nieprawidłowy rozmiar pliku CV")
      }
      if (cvFileSize && cvFileSize > 10 * 1024 * 1024) {
        errors.push("Plik CV jest zbyt duży (max 10MB)")
      }
      
      // Jeśli są błędy walidacji, STOP - nie kontynuuj
      if (errors.length > 0) {
        return NextResponse.json({ error: errors.join(", ") }, { status: 400 })
      }

      // === SPRAWDZENIE SESJI ===
      const session = await getServerSession(authOptions)
      // Sesja nie jest wymagana, ale jeśli istnieje, użyjemy userId

      // === PRZYGOTOWANIE DANYCH APLIKACJI ===
      const applicationData: any = {
        userId: (session?.user as any)?.id ?? undefined,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || undefined,
        jobId: jobId?.trim() || undefined, // Link to specific job
        position: position?.trim() || "", // Keep for backward compatibility
        experience: experience.trim(),
        skills: skills.trim(),
        education: education?.trim() || undefined,
        // HOTFIX: DB has NOT NULL on cvFileData, provide empty bytea to satisfy constraint
        cvFileData: Buffer.from([]),
      }

      // Dodanie metadanych CV jeśli są dostępne
      if (cvFileName && typeof cvFileName === 'string') applicationData.cvFileName = cvFileName
      if (cvFileType && typeof cvFileType === 'string') applicationData.cvFileType = cvFileType
      if (cvFileSize && typeof cvFileSize === 'number') applicationData.cvFileSize = cvFileSize
      
      // NOTE: Pomijamy storage fields (storageProvider, storageBucket, storageKey, fileHash) 
      // dopóki nie zastosujemy migracji bazy danych

      let created
      try {
        created = await prisma.candidateApplication.create({
          data: applicationData,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true,
            cvFileName: true,
            createdAt: true,
          }
        })
      } catch (err: any) {
        if (err?.code === 'P2011') {
          try {
            await prisma.$executeRawUnsafe('ALTER TABLE "public"."CandidateApplication" ALTER COLUMN "cvFileData" DROP NOT NULL;')
            created = await prisma.candidateApplication.create({
              data: applicationData,
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                position: true,
                cvFileName: true,
                createdAt: true,
              }
            })
          } catch (innerErr) {
            throw innerErr
          }
        } else {
          throw err
        }
      }

      // Enqueue analysis FIFO
      try { enqueueCandidateAnalysis(created.id) } catch {}
      revalidateTag("candidates")

      return NextResponse.json({ 
        success: true, 
        data: created,
        message: "Aplikacja została przesłana pomyślnie (analiza w kolejce)" 
      })
    }
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json(
      { error: "Błąd przy tworzeniu aplikacji" },
      { status: 500 }
    )
  }
}