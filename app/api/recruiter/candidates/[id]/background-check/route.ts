import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// NOTE: This endpoint only stores structured background meta info – NOT scraping arbitrary web content.
// Any implementation of external data fetching must respect legal & ethical constraints (GDPR, etc.).

const startSchema = z.object({
  consent: z.boolean().refine(v => v, 'Consent required'),
  scope: z.array(z.enum(['employment','public_activity','education'])).min(1).max(5).optional(),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const candidateId = params.id
  const record = await prisma.backgroundCheck.findUnique({ where: { candidateId } })
  if (!record) return NextResponse.json({ status: 'NONE' })
  return NextResponse.json({
    id: record.id,
    status: record.status,
    consentGiven: record.consentGiven,
    consentAt: record.consentAt,
    summary: record.summary,
    findings: record.findings,
    riskFlags: record.riskFlags,
    error: record.error,
    updatedAt: record.updatedAt,
  })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const candidateId = params.id
  const body = await req.json().catch(() => null)
  const parsed = startSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Validation', issues: parsed.error.flatten() }, { status: 400 })

  const existing = await prisma.backgroundCheck.findUnique({ where: { candidateId } })
  if (existing) {
    // If already completed just return it; if in progress – echo status
    return NextResponse.json({ status: existing.status, id: existing.id })
  }

  // Create placeholder record – actual enrichment would be async worker in real system
  const created = await prisma.backgroundCheck.create({
    data: {
      candidateId,
      requestedById: user.id,
      consentGiven: true,
      consentAt: new Date(),
      status: 'IN_PROGRESS',
      summary: null,
      findings: null,
      riskFlags: null,
    }
  })

  // Simulate asynchronous completion via setTimeout-like deferred job (here: immediate update for demo)
  // In production: push to queue (e.g. Redis) and worker updates record once done.
  try {
    await prisma.backgroundCheck.update({
      where: { id: created.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        summary: 'Podstawowa weryfikacja historii zawodowej zakończona. Brak istotnych negatywnych sygnałów.',
        findings: {
          employment: 'Potwierdzone stanowiska z CV nie wykazują sprzeczności w publicznych źródłach.',
          public_activity: 'Brak kontrowersyjnych publicznych wypowiedzi w szybkiej kontroli.',
        },
        riskFlags: [],
      }
    })
  } catch (e) {
    await prisma.backgroundCheck.update({ where: { id: created.id }, data: { status: 'FAILED', error: 'Processing error' } })
  }

  return NextResponse.json({ status: 'IN_PROGRESS', id: created.id })
}
