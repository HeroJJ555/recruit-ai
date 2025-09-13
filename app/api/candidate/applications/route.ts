import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { revalidateTag } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// POST /api/candidate/applications
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || ""

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData()
      const firstName = String(form.get("firstName") || "").trim()
      const lastName = String(form.get("lastName") || "").trim()
      const email = String(form.get("email") || "").trim().toLowerCase()
      const phone = String(form.get("phone") || "").trim() || null
      const position = String(form.get("position") || "").trim()
      const experience = String(form.get("experience") || "").trim()
      const skills = String(form.get("skills") || "").trim()
      const education = String(form.get("education") || "").trim() || null
      const cv = form.get("cv") as File | null

      if (!firstName || !lastName || !email || !position || !experience || !cv) {
        return NextResponse.json({ error: "Brak wymaganych pól" }, { status: 400 })
      }

      // Validate file type and size (max 10MB)
      const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
      if (cv.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "Plik jest zbyt duży (max 10MB)" }, { status: 413 })
      }
      if (cv.type && !allowed.includes(cv.type)) {
        return NextResponse.json({ error: "Niedozwolony format pliku" }, { status: 400 })
      }

      const arrayBuffer = await cv.arrayBuffer()
      const session = await getServerSession(authOptions)

      const created = await prisma.candidateApplication.create({
        data: {
          userId: (session?.user as any)?.id ?? undefined,
          firstName,
          lastName,
          email,
          phone: phone || undefined,
          position,
          experience,
          skills,
          education: education || undefined,
          cvFileName: cv.name,
          cvFileType: cv.type || "application/octet-stream",
          cvFileSize: cv.size,
          cvFileData: Buffer.from(arrayBuffer),
        },
      })

      // Invalidate cache tag so listings can refresh
      revalidateTag("candidate-applications")

      return NextResponse.json({ id: created.id }, { status: 201 })
    }

    // JSON fallback (no file): accept base64 cvFile
  const session = await getServerSession(authOptions)
  const body = await req.json()
    const { firstName, lastName, email, phone, position, experience, skills, education, cvFileName, cvFileType, cvFileBase64 } = body || {}

    if (!firstName || !lastName || !email || !position || !experience || !cvFileName || !cvFileBase64) {
      return NextResponse.json({ error: "Brak wymaganych pól" }, { status: 400 })
    }

    const created = await prisma.candidateApplication.create({
      data: {
        userId: (session?.user as any)?.id ?? undefined,
        firstName,
        lastName,
        email: String(email).toLowerCase(),
        phone: phone || undefined,
        position,
        experience,
        skills: skills || "",
        education: education || undefined,
        cvFileName,
        cvFileType: cvFileType || "application/octet-stream",
        cvFileSize: Math.ceil((cvFileBase64.length * 3) / 4),
        cvFileData: Buffer.from(cvFileBase64, "base64"),
      },
    })

    revalidateTag("candidate-applications")

    return NextResponse.json({ id: created.id }, { status: 201 })
  } catch (err: any) {
    console.error("Application submit error", err)
    return NextResponse.json({ error: "Wewnętrzny błąd serwera" }, { status: 500 })
  }
}

// Optional: minimal GET with caching and pagination
export const dynamic = "force-dynamic"
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get("page") || 1)
  const pageSize = Math.min(Number(searchParams.get("pageSize") || 10), 100)

  const [items, total] = await Promise.all([
    prisma.candidateApplication.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: { id: true, firstName: true, lastName: true, email: true, position: true, experience: true, createdAt: true },
    }),
    prisma.candidateApplication.count(),
  ])

  return NextResponse.json({ items, total, page, pageSize }, {
    headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
  })
}
