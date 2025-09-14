import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  name: z.string().trim().min(2, "Minimalnie 2 znaki").max(80, "Za długie").optional(),
  image: z
    .string()
    .url("Nieprawidłowy URL")
    .max(300, "URL zbyt długi")
    .or(z.literal(""))
    .optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userEmail = session?.user?.email
    if (!userEmail) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 })
    }
    let body: unknown
    try { body = await req.json() } catch { return NextResponse.json({ error: "Nieprawidłowe JSON" }, { status: 400 }) }
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Walidacja", issues: parsed.error.flatten() }, { status: 400 })
    }
    const { name, image } = parsed.data
    const updated = await prisma.user.update({
      where: { email: userEmail },
      data: {
        name: name === undefined ? undefined : name,
        image: image === undefined ? undefined : image || null,
      },
      select: { id: true, name: true, image: true, email: true },
    })
    return NextResponse.json({ user: updated })
  } catch (e: any) {
    return NextResponse.json({ error: "Aktualizacja nie powiodła się" }, { status: 500 })
  }
}
