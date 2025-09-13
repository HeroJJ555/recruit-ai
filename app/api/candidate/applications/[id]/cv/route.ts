import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Load minimal application metadata for fallbacks
  const appMeta = await prisma.candidateApplication.findUnique({
    where: { id: params.id },
    select: { userId: true, cvFileName: true, cvFileType: true, createdAt: true },
  })
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'cvs'

  // 1) Prefer probing storage directly: take the latest file under applications/<id>
  const prefix = `applications/${params.id}`
  const { data: files, error: listErr } = await supabaseAdmin.storage.from(bucket).list(prefix, {
    limit: 100,
    offset: 0,
    sortBy: { column: 'updated_at', order: 'desc' },
  })
  if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 })

  let key: string | null = null
  if (files && files.length > 0) {
    const latest = files[0]
    key = `${prefix}/${latest.name}`
  } else {
    // 2) Fallback: try to find by cvFileName anywhere under applications/
    const wantedName = appMeta?.cvFileName
    if (wantedName) {
      // list folders under applications/
      const { data: folders, error: listFoldersErr } = await supabaseAdmin.storage.from(bucket).list('applications', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'desc' },
      })
      if (listFoldersErr) return NextResponse.json({ error: listFoldersErr.message }, { status: 500 })
      if (folders && folders.length > 0) {
        for (const f of folders) {
          // Skip files; we only want folders
          if (!f.name) continue
          const folderPath = `applications/${f.name}`
          const { data: inner, error: innerErr } = await supabaseAdmin.storage.from(bucket).list(folderPath, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'updated_at', order: 'desc' },
          })
          if (innerErr) continue
          const hit = inner?.find((it: any) => it.name === wantedName)
          if (hit) {
            key = `${folderPath}/${hit.name}`
            break
          }
        }
      }
    }

    // 3) Fallback: old scheme might be applications/<userId>/<randomName> or applications/anon/<randomName>
    if (!key) {
      const tryFolders: string[] = []
      if (appMeta?.userId) tryFolders.push(`applications/${appMeta.userId}`)
      tryFolders.push('applications/anon')

      // map mime -> accepted extensions
      const type = (appMeta?.cvFileType || '').toLowerCase()
      const exts = type.includes('pdf') ? ['pdf'] : type.includes('wordprocessingml') ? ['docx'] : type.includes('msword') ? ['doc'] : []
      const appTime = appMeta?.createdAt ? new Date(appMeta.createdAt).getTime() : null

      for (const folderPath of tryFolders) {
        const { data: inner, error: innerErr } = await supabaseAdmin.storage.from(bucket).list(folderPath, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'updated_at', order: 'desc' },
        })
        if (innerErr || !inner || inner.length === 0) continue

        // pick best candidate by ext + closest updated_at to application createdAt
        let candidate: any = null
        let bestDelta = Number.POSITIVE_INFINITY
        for (const it of inner) {
          const name: string = (it as any).name || ''
          const ext = name.split('.').pop()?.toLowerCase()
          const t = (it as any).updated_at ? new Date((it as any).updated_at).getTime() : null
          if (exts.length > 0 && ext && !exts.includes(ext)) continue
          if (appTime && t) {
            const delta = Math.abs(t - appTime)
            if (delta < bestDelta) {
              bestDelta = delta
              candidate = it
            }
          } else {
            // No timing info — fallback to first item
            candidate = it
            break
          }
        }
        if (candidate) {
          key = `${folderPath}/${(candidate as any).name}`
          break
        }
      }
    }
  }

  if (!key) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(key, 60 * 60 * 24 * 365) // 1 rok
  if (error || !data) return NextResponse.json({ error: error?.message || "Signed URL error" }, { status: 500 })

  return NextResponse.redirect(data.signedUrl)
}
