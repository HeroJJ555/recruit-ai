import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const jobUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  employmentType: z.string().optional(),
  seniority: z.string().optional(),
  description: z.string().min(10).optional(),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  benefits: z.string().optional(),
  openings: z.number().int().min(1).max(999).optional(),
  status: z.enum(["DRAFT","OPEN","PAUSED","CLOSED"]).optional(),
  publish: z.boolean().optional(),
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
    const data = jobUpdateSchema.parse(await req.json())

    // Handle publish toggle
    if (data.publish && !data.status) {
      (data as any).status = "OPEN"
      ;(data as any).publishedAt = new Date()
    }

  const jobModel = (prisma as any).job
  if (!jobModel) return NextResponse.json({ error: "Model Job niedostępny (uruchom migrację)" }, { status: 500 })
  const updated = await jobModel.update({ where: { id: params.id }, data })
    return NextResponse.json(updated)
  } catch (e: any) {
    if (e.name === "ZodError") {
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
