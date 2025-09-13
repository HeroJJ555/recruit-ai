import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const jobCreateSchema = z.object({
  title: z.string().min(3),
  department: z.string().optional(),
  location: z.string().optional(),
  employmentType: z.string().optional(),
  seniority: z.string().optional(),
  description: z.string().min(10),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  benefits: z.string().optional(),
  openings: z.number().int().min(1).max(999).default(1),
  status: z.enum(["DRAFT","OPEN","PAUSED","CLOSED"]).optional(),
  publish: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  const jobModel = (prisma as any).job
  if (!jobModel) {
    return NextResponse.json({ error: "Model Job nie jest dostępny – uruchom migrację: npx prisma migrate dev && npx prisma generate" }, { status: 500 })
  }
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") as any
  const q = searchParams.get("q")?.trim()
  const where: any = {}
  if (status) where.status = status
  if (q) where.OR = [
    { title: { contains: q, mode: "insensitive" } },
    { department: { contains: q, mode: "insensitive" } },
  ]
  const jobs = await jobModel.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id:true, title:true, status:true, department:true, location:true, openings:true, createdAt:true, publishedAt:true },
  })
  return NextResponse.json(jobs)
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const jobModel = (prisma as any).job
    if (!jobModel) {
      return NextResponse.json({ error: "Model Job nie jest dostępny – uruchom migrację: npx prisma migrate dev && npx prisma generate" }, { status: 500 })
    }
    const json = await req.json()
    const parsed = jobCreateSchema.parse(json)

    // Basic slug creation
    const baseSlug = parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60)
    // Ensure uniqueness
    let slug = baseSlug
    let i = 1
  while (await jobModel.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`
    }

  const created = await jobModel.create({
      data: {
        title: parsed.title,
        department: parsed.department,
        location: parsed.location,
        employmentType: parsed.employmentType,
        seniority: parsed.seniority,
        description: parsed.description,
        requirements: parsed.requirements,
        responsibilities: parsed.responsibilities,
        benefits: parsed.benefits,
        openings: parsed.openings ?? 1,
        status: parsed.status ?? (parsed.publish ? "OPEN" : "DRAFT"),
        publishedAt: parsed.publish ? new Date() : null,
        ownerId: (session.user as any)?.id ?? null,
      },
      select: { id:true, slug:true },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (e: any) {
    if (e.name === "ZodError") {
      return NextResponse.json({ error: e.errors }, { status: 400 })
    }
    console.error("Job create error", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
