import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const jobUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  department: z.string().nullish(),
  location: z.string().nullish(),
  employmentType: z.string().nullish(),
  seniority: z.string().nullish(),
  description: z.string().min(5).optional(), // Reduced from 10 to 5
  requirements: z.string().nullish(),
  responsibilities: z.string().nullish(),
  benefits: z.string().nullish(),
  openings: z.number().int().min(1).max(999).optional(),
  status: z.enum(["DRAFT","OPEN","PAUSED","CLOSED"]).optional(),
  publish: z.boolean().optional(),
  goldenCandidate: z.object({
    role: z.string().nullish(),
    level: z.string().nullish(),
    skills: z.string().nullish(),
    summary: z.string().nullish(),
  }).optional(),
})

async function ensureAuth() {
  const session = await getServerSession(authOptions)
  if (!session) return null
  return session
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const jobModel = (prisma as any).job
  if (!jobModel) return NextResponse.json({ error: "Model Job niedostępny (uruchom migrację)" }, { status: 500 })
  const job = await jobModel.findUnique({ where: { id: params.id } })
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(job)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await ensureAuth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const rawData = await req.json()
    console.log("PATCH data received:", JSON.stringify(rawData, null, 2))
    
    const data = jobUpdateSchema.parse(rawData)

    // Handle publish toggle and remove it from data
    if (data.publish !== undefined) {
      if (data.publish && !data.status) {
        (data as any).status = "OPEN"
        ;(data as any).publishedAt = new Date()
      }
      // Remove publish field as it's not part of the database schema
      delete (data as any).publish
    }

    console.log("Processed data for Prisma:", JSON.stringify(data, null, 2))

  const jobModel = (prisma as any).job
  if (!jobModel) return NextResponse.json({ error: "Model Job niedostępny (uruchom migrację)" }, { status: 500 })
  const updated = await jobModel.update({ where: { id: params.id }, data })
    return NextResponse.json(updated)
  } catch (e: any) {
    console.error("PATCH error:", e)
    if (e.name === "ZodError") {
      console.error("Zod validation errors:", e.errors)
      return NextResponse.json({ error: e.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await ensureAuth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
  const jobModel = (prisma as any).job
  if (!jobModel) return NextResponse.json({ error: "Model Job niedostępny (uruchom migrację)" }, { status: 500 })
  await jobModel.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
}
