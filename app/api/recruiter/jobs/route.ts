import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase-admin"

const jobCreateSchema = z.object({
  title: z.string().min(3),
  department: z.string().nullish(),
  location: z.string().nullish(),
  employmentType: z.string().nullish(),
  seniority: z.string().nullish(),
  description: z.string().min(5), // Reduced from 10 to 5
  requirements: z.string().nullish(),
  responsibilities: z.string().nullish(),
  benefits: z.string().nullish(),
  openings: z.number().int().min(1).max(999).default(1),
  status: z.enum(["DRAFT","OPEN","PAUSED","CLOSED"]).optional(),
  publish: z.boolean().optional(),
  goldenCandidate: z.object({
    role: z.string().nullish(),
    level: z.string().nullish(),
    skills: z.string().nullish(),
    summary: z.string().nullish(),
  }).optional(),
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
  const currentUser = session.user as any
    const jobModel = (prisma as any).job
    if (!jobModel) {
      return NextResponse.json({ error: "Model Job nie jest dostępny – uruchom migrację: npx prisma migrate dev && npx prisma generate" }, { status: 500 })
    }
    const json = await req.json()
    console.log("POST data received:", JSON.stringify(json, null, 2))
    
    const parsed = jobCreateSchema.parse(json)

    // Basic slug creation
    const baseSlug = parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60)
    // Ensure uniqueness
    let slug = baseSlug
    let i = 1
  while (await jobModel.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`
    }

    // Resolve a valid ownerId that exists in the DB to avoid FK errors
    async function ensureOwnerId(): Promise<string | null> {
      try {
        const sid = currentUser?.id as string | undefined
        const email = currentUser?.email as string | undefined
        const name = currentUser?.name as string | undefined
        const image = currentUser?.image as string | undefined

        // Prefer id lookup
        if (sid) {
          const byId = await (prisma as any).user.findUnique({ where: { id: sid } })
          if (byId) return byId.id
          if (email) {
            // Create user with the known id to match session
            try {
              const created = await (prisma as any).user.create({ data: { id: sid, email, name: name ?? null, image: image ?? null } })
              console.info("Created missing User for session id", created.id)
              return created.id
            } catch (e) {
              console.warn("Failed to create User with session id; trying email-only:", e)
            }
          }
        }

        // Fallback to email lookup/create
        if (email) {
          const byEmail = await (prisma as any).user.findUnique({ where: { email } })
          if (byEmail) return byEmail.id
          const createdByEmail = await (prisma as any).user.create({ data: { email, name: name ?? null, image: image ?? null } })
          console.info("Created missing User by email", createdByEmail.id)
          return createdByEmail.id
        }
      } catch (e) {
        console.warn("ensureOwnerId failed, falling back to null:", e)
      }
      return null
    }
    const ownerId = await ensureOwnerId()

  const data: any = {
        title: parsed.title,
        slug: slug,
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
        // Try to store goldenCandidate JSON directly (requires migrated schema)
        ...(parsed.goldenCandidate ? { /* @ts-ignore */ goldenCandidate: parsed.goldenCandidate } : {}),
      }
    if (ownerId) data.ownerId = ownerId
    console.debug("Creating Job with ownerId:", ownerId)
    const created = await jobModel.create({ data, select: { id:true, slug:true } })

    // Try to persist goldenCandidate profile
    const golden = parsed.goldenCandidate
    if (golden && (golden.role || golden.level || golden.skills || golden.summary)) {
      // Attempt DB JSON field first (if exists in migrated schema)
      try {
        await jobModel.update({ where: { id: created.id }, data: { /* @ts-ignore */ goldenCandidate: golden } })
      } catch {
        // Fallback to object storage
        const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'cvs'
        const key = `jobs/${created.id}/goldenCandidate.json`
        const blob = new Blob([JSON.stringify(golden, null, 2)], { type: 'application/json' })
        await supabaseAdmin.storage.from(bucket).upload(key, blob, { upsert: true, contentType: 'application/json' })
      }
    }

    return NextResponse.json(created, { status: 201 })
  } catch (e: any) {
    console.error("POST error:", e)
    if (e.name === "ZodError") {
      console.error("Zod validation errors:", e.errors)
      return NextResponse.json({ error: e.errors }, { status: 400 })
    }
    console.error("Job create error", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
