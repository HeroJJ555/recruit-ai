import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const app = await prisma.candidateApplication.findUnique({
    where: { id: params.id },
    select: { storageBucket: true, storageKey: true, cvFileName: true },
  })
  if (!app || !app.storageBucket || !app.storageKey) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { data, error } = await supabaseAdmin.storage.from(app.storageBucket).createSignedUrl(app.storageKey, 60)
  if (error || !data) return NextResponse.json({ error: error?.message || "Signed URL error" }, { status: 500 })

  return NextResponse.redirect(data.signedUrl)
}
