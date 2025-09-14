import { NextRequest, NextResponse } from "next/server"
import crypto from "node:crypto"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get("cv") as File | null
  const applicationId = String(form.get("applicationId") || "")
  if (!file) return NextResponse.json({ error: "Brak pliku" }, { status: 400 })

    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Plik jest zbyt duży (max 10MB)" }, { status: 413 })
    if (file.type && !allowed.includes(file.type)) return NextResponse.json({ error: "Niedozwolony format pliku" }, { status: 400 })

    const buf = Buffer.from(await file.arrayBuffer())
    const hash = crypto.createHash("sha256").update(buf).digest("hex")

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "cvs"
    const ext = file.name.split(".").pop() || "pdf"
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id || "anon"
    // Jeśli mamy applicationId, używamy deterministycznego klucza; w przeciwnym razie zachowujemy dotychczasowy schemat
    const key = applicationId
      ? `applications/${applicationId}/${file.name}`
      : `applications/${userId}/${crypto.randomUUID()}-${Date.now()}.${ext}`

    const { error: uploadError } = await supabaseAdmin.storage.from(bucket).upload(key, buf, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    })
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

    // Trigger CV analysis AFTER successful upload if applicationId is provided
    if (applicationId) {
      try {
        // Schedule background analysis - fire and forget
        fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/candidate/applications/${applicationId}/analyze`, {
          method: 'GET',
        }).catch(() => {}) // Silent fail - analysis can be triggered manually later
      } catch (error) {
        // Don't fail upload if analysis scheduling fails
        console.log('Failed to schedule CV analysis:', error)
      }
    }

    return NextResponse.json({ bucket, key, hash, size: file.size, type: file.type || "application/octet-stream", name: file.name }, { status: 201 })
  } catch (e: any) {
    console.error("Upload error", e)
    return NextResponse.json({ error: "Wewnętrzny błąd serwera" }, { status: 500 })
  }
}
