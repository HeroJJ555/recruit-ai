import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Brak wymaganych danych" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Użytkownik o takim email już istnieje" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    await prisma.user.create({
      data: { name: name || null, email, passwordHash },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}
