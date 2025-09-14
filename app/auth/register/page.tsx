"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onSubmit(formData: FormData) {
    setLoading(true)
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success("Konto utworzone. Możesz się zalogować.")
      router.push("/auth/signin")
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data?.error || "Nie udało się utworzyć konta")
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Card className="border-2">
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="font-heading text-2xl font-bold">Rejestracja</h1>
              <p className="text-muted-foreground text-sm">Utwórz konto, aby korzystać z panelu</p>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget as HTMLFormElement)
                await onSubmit(fd)
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Imię i nazwisko</Label>
                <Input id="name" name="name" placeholder="Jan Kowalski" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="jan@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Hasło</Label>
                <Input id="password" name="password" type="password" required minLength={6} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Rejestrowanie..." : "Zarejestruj się"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
