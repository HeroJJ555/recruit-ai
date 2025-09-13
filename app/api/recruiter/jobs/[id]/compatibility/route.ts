import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { chatJSON, heuristicCompatibility } from "@/lib/ai"

type Golden = { role?: string; level?: string; skills?: string; summary?: string }

function parseSkills(s?: string | null) {
  return (s || "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean)
}

function scoreCompatibility(golden: Golden, analysis: any) {
  let score = 0
  let max = 100

  const gSkills = new Set(parseSkills(golden.skills))
  const aSkills = new Set((analysis?.key_skills || []).map((x: string) => (x || "").toLowerCase()))
  const inter = [...gSkills].filter((s) => aSkills.has(s)).length
  const skillsWeight = 60
  const skillsScore = gSkills.size > 0 ? Math.round((inter / gSkills.size) * skillsWeight) : 0
  score += skillsScore

  const gLevel = (golden.level || '').toLowerCase()
  const aSeniority = (analysis?.seniority || '').toLowerCase()
  const levelWeight = 20
  score += gLevel && aSeniority && gLevel === aSeniority ? levelWeight : 0

  const rolesWeight = 20
  const gRole = (golden.role || '').toLowerCase()
  const roles = (analysis?.top_roles || []).map((r: string) => (r || '').toLowerCase())
  score += gRole && roles.includes(gRole) ? rolesWeight : 0

  if (score < 0) score = 0
  if (score > max) score = max
  return { score, breakdown: { skillsScore, skillsWeight, levelWeight, rolesWeight, inter, gSkills: [...gSkills] } }
}

async function readGolden(jobId: string) {
  // Try DB JSON field first
  try {
    const job = await (prisma as any).job.findUnique({ where: { id: jobId }, select: { /* @ts-ignore */ goldenCandidate: true } })
    if (job?.goldenCandidate) return job.goldenCandidate as Golden
  } catch {}
  // Fallback: Supabase storage
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'cvs'
  const key = `jobs/${jobId}/goldenCandidate.json`
  const { data } = await supabaseAdmin.storage.from(bucket).download(key)
  if (!data) return null
  try { return JSON.parse(await data.text()) } catch { return null }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const jobId = params.id
  const appId = new URL(req.url).searchParams.get('applicationId')
  if (!appId) return NextResponse.json({ error: 'applicationId required' }, { status: 400 })

  const golden = await readGolden(jobId)
  if (!golden) return NextResponse.json({ error: 'Golden Candidate not set' }, { status: 404 })

  // Load cached analysis
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'cvs'
  const key = `applications/${appId}/analysis.json`
  const { data } = await supabaseAdmin.storage.from(bucket).download(key)
  if (!data) return NextResponse.json({ error: 'CV analysis not found' }, { status: 404 })
  const analysis = JSON.parse(await data.text())

  // Try AI scoring first (if provider configured), fallback to heuristic
  try {
    const prompt = `You are a recruiting assistant. Given a GOLDEN_CANDIDATE profile and a CV_ANALYSIS, compute a compatibility JSON with keys: score (0-100 integer), breakdown (object with short notes). Only JSON.\n\nGOLDEN_CANDIDATE:\n${JSON.stringify(golden)}\n\nCV_ANALYSIS:\n${JSON.stringify(analysis)}`
    const ai = await chatJSON(prompt)
    if (typeof ai?.score === 'number') {
      return NextResponse.json({ score: Math.max(0, Math.min(100, Math.round(ai.score))), breakdown: ai.breakdown || {} })
    }
  } catch {}

  const result = heuristicCompatibility(golden, analysis)
  return NextResponse.json(result)
}
