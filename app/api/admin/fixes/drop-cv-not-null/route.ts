import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const adminKey = req.headers.get('x-admin-key') || ''
  const expected = process.env.ADMIN_MAINT_KEY || ''
  if (expected && adminKey !== expected) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "public"."CandidateApplication" ALTER COLUMN "cvFileData" DROP NOT NULL;'
    )
    return NextResponse.json({ ok: true, message: 'cvFileData is now NULLABLE' })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Unknown error' }, { status: 500 })
  }
}