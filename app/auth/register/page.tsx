"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Brain, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "candidate" as "candidate" | "recruiter",
    company: "", // For recruiters
    acceptTerms: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Hasła nie są identyczne")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Hasło musi mieć co najmniej 6 znaków")
      setIsLoading(false)
      return
    }

    if (!formData.acceptTerms) {
      setError("Musisz zaakceptować regulamin")
      setIsLoading(false)
      return
    }

    if (formData.userType === "recruiter" && !formData.company) {
      setError("Nazwa firmy jest wymagana dla rekruterów")
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            user_type: formData.userType,
            company: formData.company,
          },
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        setSuccess(true)
        console.log("[v0] User registered:", data.user.email)

        // TODO: Create user profile in database
        // TODO: Send welcome email

        setTimeout(() => {
          router.push("/auth/login")
        }, 3000)
      }
    } catch (err) {
      setError("Wystąpił błąd podczas rejestracji")
      console.error("[v0] Registration error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="font-heading font-bold text-2xl mb-4">Rejestracja zakończona!</h2>
              <p className="text-muted-foreground mb-6">
                Sprawdź swoją skrzynkę email i kliknij link aktywacyjny, aby dokończyć rejestrację.
              </p>
              <p className="text-sm text-muted-foreground">
                Zostaniesz automatycznie przekierowany do strony logowania...
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
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
            <h1 className="font-heading font-bold text-3xl text-foreground mb-2">Utwórz konto</h1>
            <p className="text-muted-foreground">Dołącz do platformy rekrutacyjnej i rozpocznij swoją przygodę z AI</p>
          </div>

          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-heading">Rejestracja</CardTitle>
              <CardDescription>Wypełnij formularz, aby utworzyć nowe konto</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-6">
                {/* User Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="userType">Typ konta</Label>
                  <Select
                    value={formData.userType}
                    onValueChange={(value: "candidate" | "recruiter") => handleInputChange("userType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz typ konta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="candidate">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Kandydat - szukam pracy</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="recruiter">
                        <div className="flex items-center space-x-2">
                          <Brain className="h-4 w-4" />
                          <span>Rekruter - szukam talentów</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Imię</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Jan"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nazwisko</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Kowalski"
                      required
                    />
                  </div>
                </div>

                {/* Company (for recruiters) */}
                {formData.userType === "recruiter" && (
                  <div className="space-y-2">
                    <Label htmlFor="company">Nazwa firmy</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      placeholder="Nazwa Twojej firmy"
                      required
                    />
                  </div>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
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
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Minimum 6 znaków"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      placeholder="Powtórz hasło"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Terms Acceptance */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleInputChange("acceptTerms", checked as boolean)}
                  />
                  <Label htmlFor="acceptTerms" className="text-sm">
                    Akceptuję{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      regulamin
                    </Link>{" "}
                    i{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      politykę prywatności
                    </Link>
                  </Label>
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
                  {isLoading ? "Tworzenie konta..." : "Utwórz konto"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Masz już konto?{" "}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Zaloguj się
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
