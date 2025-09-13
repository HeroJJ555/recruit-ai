import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { chatJSON, heuristicAnalysis } from "@/lib/ai"

export const maxDuration = 60

function extOf(name?: string | null) {
  if (!name) return ""
  const i = name.lastIndexOf(".")
  return i >= 0 ? name.slice(i + 1).toLowerCase() : ""
}

async function getLatestCvKey(appId: string, bucket: string) {
  const prefix = `applications/${appId}`
  const { data: files, error } = await supabaseAdmin.storage.from(bucket).list(prefix, {
    limit: 100,
    offset: 0,
    sortBy: { column: 'updated_at', order: 'desc' },
  })
  if (error) throw new Error(error.message)
  if (files && files.length > 0) return `${prefix}/${files[0].name}`
  return null
}

async function downloadAsArrayBuffer(bucket: string, key: string) {
  const { data, error } = await supabaseAdmin.storage.from(bucket).download(key)
  if (error || !data) throw new Error(error?.message || "Download failed")
  // supabase-js returns a Blob in node env too; convert to ArrayBuffer
  const buf = await data.arrayBuffer()
  return buf
}

async function extractText(fileName: string, bytes: ArrayBuffer): Promise<string> {
  const ext = extOf(fileName)
  if (ext === 'pdf') {
    // Lazy import to avoid loading when not needed
    const pdfParse = (await import('pdf-parse')).default as any
    const res = await pdfParse(Buffer.from(bytes))
    return String(res.text || '').trim()
  }
  if (ext === 'docx') {
    const mammoth = await import('mammoth') as any
    const res = await mammoth.extractRawText({ buffer: Buffer.from(bytes) })
    return String(res.value || '').trim()
  }
  if (ext === 'txt') {
    return Buffer.from(bytes).toString('utf-8')
  }
  // Fallback: try utf-8 decode
  return Buffer.from(bytes).toString('utf-8')
}

function buildPrompt(text: string) {
  const clipped = text.length > 16000 ? text.slice(0, 16000) : text
  return `You are a recruiting assistant. Analyze the CV text below and return a concise JSON with keys: summary, key_skills (array), total_experience_years (number), seniority (one of: junior, mid, senior, lead), top_roles (array of strings), education (array of strings), languages (array of strings), notable_projects (array of strings), risks (array of strings). Only JSON, no extra text.\n\nCV_TEXT:\n${clipped}`
}

// Removed direct OpenAI call; we use lib/ai provider abstraction.

async function readCached(bucket: string, appId: string) {
  const key = `applications/${appId}/analysis.json`
  const { data } = await supabaseAdmin.storage.from(bucket).download(key)
  if (!data) return null
  try {
    const txt = await data.text()
    return JSON.parse(txt)
  } catch {
    return null
  }
}

async function writeCached(bucket: string, appId: string, value: any) {
  const key = `applications/${appId}/analysis.json`
  const content = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' })
  await supabaseAdmin.storage.from(bucket).upload(key, content, { upsert: true, contentType: 'application/json' })
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const search = new URL(req.url).searchParams
  const refresh = search.get('refresh') === '1'
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'cvs'

  const app = await prisma.candidateApplication.findUnique({
    where: { id: params.id },
    select: { id: true, cvFileName: true }
  })
  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!refresh) {
    const cached = await readCached(bucket, app.id)
    if (cached) return NextResponse.json({ cached: true, result: cached })
  }

  const key = await getLatestCvKey(app.id, bucket)
  if (!key) return NextResponse.json({ error: 'CV not found in storage' }, { status: 404 })

  try {
    const bytes = await downloadAsArrayBuffer(bucket, key)
    const text = await extractText(app.cvFileName || key.split('/').pop() || 'file', bytes)
      .catch(() => '') // fallback in case
    // If extractText threw because of missing deps, re-run with bytes param properly
    const finalText = typeof text === 'string' && text.length > 0 ? text : await (async () => {
      try { return await extractText(key.split('/').pop() || 'file', bytes) } catch { return '' }
    })()
    if (!finalText) return NextResponse.json({ error: 'Could not extract text from CV' }, { status: 422 })

    const prompt = buildPrompt(finalText)
    let result: any
    try {
      result = await chatJSON(prompt)
    } catch (e) {
      // No provider configured: fallback to heuristic extraction (free)
      result = heuristicAnalysis(finalText)
    }
    await writeCached(bucket, app.id, result)
    return NextResponse.json({ cached: false, result })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Analysis failed' }, { status: 500 })
  }
}
