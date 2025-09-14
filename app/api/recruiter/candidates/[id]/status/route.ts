import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Allowed statuses consistent with ApplicationStatus enum in schema.prisma
const ALLOWED = new Set([
  'PENDING','REVIEWED','CONTACTED','INTERVIEW_SCHEDULED','INTERVIEW_COMPLETED','REJECTED','HIRED','WAITING','INTERVIEW','WITHDRAWN'
])

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json().catch(() => ({})) as { status?: string }
    const next = body.status
    if (!next || !ALLOWED.has(next)) {
      return NextResponse.json({ error: 'Invalid status', allowed: Array.from(ALLOWED) }, { status: 400 })
    }
    // Some generated Prisma client mismatch prevents typed update; fallback raw query
    try {
      await (prisma as any).$executeRawUnsafe(`UPDATE "CandidateApplication" SET "status" = $1, "updatedAt" = NOW() WHERE id = $2`, next, params.id)
    } catch (e) {
      console.error('Raw status update failed', e)
      return NextResponse.json({ error: 'Failed raw update' }, { status: 500 })
    }
    return NextResponse.json({ candidate: { id: params.id, status: next } })
  } catch (e) {
    console.error('Status PATCH error', e)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}