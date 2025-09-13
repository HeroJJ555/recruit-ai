"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Github, Mail, ShieldCheck } from "lucide-react"
import { signIn } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function SignInPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Card className="border-2">
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="font-heading text-2xl font-bold">Zaloguj się</h1>
              <p className="text-muted-foreground text-sm">
                Zaloguj się przez Google lub email i hasło
              </p>
            </div>

            <div className="space-y-3">
              <Button size="lg" className="w-full" onClick={() => signIn("google", { callbackUrl: "/" })}>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M21.35 11.1h-9.18v2.97h5.3c-.23 1.47-1.6 4.3-5.3 4.3-3.19 0-5.8-2.64-5.8-5.9s2.61-5.9 5.8-5.9c1.82 0 3.04.77 3.74 1.43l2.55-2.46C17.1 3.9 15.1 3 12.17 3 6.99 3 2.8 7.04 2.8 12s4.19 9 9.37 9c5.41 0 8.98-3.8 8.98-9.16 0-.62-.07-1.08-.2-1.74z" />
                </svg>
                Zaloguj przez Google
              </Button>

              {/* Credentials login */}
              <div className="pt-2">
                <form
                  className="space-y-3"
                  onSubmit={async (e) => {
                    e.preventDefault()
                    const form = e.currentTarget as HTMLFormElement
                    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value
                    const password = (form.elements.namedItem("password") as HTMLInputElement)?.value
                    await signIn("credentials", { email, password, callbackUrl: "/", redirect: true })
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Hasło</Label>
                    <Input id="password" name="password" type="password" required />
                  </div>
                  <Button type="submit" className="w-full" variant="outline">
                    <Mail className="mr-2 h-5 w-5" /> Zaloguj przez email
                  </Button>
                </form>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              <span>Twoje dane są chronione i wykorzystywane wyłącznie do logowania.</span>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Nie masz konta? <Link className="text-primary hover:underline" href="/auth/register">Zarejestruj się</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
