import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const app = await prisma.candidateApplication.findUnique({
    where: { id: params.id },
    include: { cvAnalysis: true }
  })
  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!app.cvAnalysis) {
    return NextResponse.json({ error: 'No analysis' }, { status: 404 })
  }

  const a = app.cvAnalysis as any
  const result = {
    summary: a.summary || '',
    compatibility_score: a.matchScore ?? null,
    key_highlights: Array.isArray(a.technicalSkills) ? (a.technicalSkills as any[]).slice(0, 5) : [],
    technical_skills: a.technicalSkills || [],
    experience_summary: {
      years: a.experienceYears || 0,
      level: 'mid',
      key_roles: []
    },
    standout_projects: [],
    interview_questions: a.interviewQuestions || [],
    potential_concerns: [],
    metadata: {
      source: 'database',
      ai_provider: a.aiProvider,
      ai_model: a.aiModel,
      token_usage: a.tokenUsage,
      processing_time_ms: a.processingTimeMs,
      created_at: a.createdAt,
      updated_at: a.updatedAt
    }
  }

  return NextResponse.json({ cached: true, source: 'database', result })
}
