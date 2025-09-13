"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, Mail, Lock, User, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState<"candidate" | "recruiter">("candidate")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || (userType === "recruiter" ? "/recruiter" : "/candidate")

  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        // TODO: Check user role from database and redirect accordingly
        console.log("[v0] User logged in:", data.user.email)
        router.push(redirectTo)
      }
    } catch (err) {
      setError("Wystąpił błąd podczas logowania")
      console.error("[v0] Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 rounded-full p-4">
                <Brain className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="font-heading font-bold text-3xl text-foreground mb-2">Zaloguj się</h1>
            <p className="text-muted-foreground">Wprowadź swoje dane, aby uzyskać dostęp do platformy rekrutacyjnej</p>
          </div>

          {/* Login Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-heading">Logowanie</CardTitle>
              <CardDescription>Wybierz typ konta i wprowadź swoje dane logowania</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                {/* User Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="userType">Typ konta</Label>
                  <Select value={userType} onValueChange={(value: "candidate" | "recruiter") => setUserType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz typ konta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="candidate">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Kandydat</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="recruiter">
                        <div className="flex items-center space-x-2">
                          <Brain className="h-4 w-4" />
                          <span>Rekruter</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="twoj.email@example.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Hasło</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Wprowadź hasło"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logowanie..." : "Zaloguj się"}
                </Button>

                {/* Demo Accounts */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center">Konta demo:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEmail("demo.kandydat@recruitai.pl")
                        setPassword("demo123")
                        setUserType("candidate")
                      }}
                      className="bg-transparent"
                    >
                      Demo Kandydat
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEmail("demo.rekruter@recruitai.pl")
                        setPassword("demo123")
                        setUserType("recruiter")
                      }}
                      className="bg-transparent"
                    >
                      Demo Rekruter
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Nie masz konta?{" "}
              <Link href="/auth/register" className="text-primary hover:underline font-medium">
                Zarejestruj się
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
