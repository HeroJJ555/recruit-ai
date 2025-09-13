"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

export function CVUploadForm() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    experience: "",
    skills: "",
    education: "",
    cvFile: null as File | null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, cvFile: file }))
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      // === WALIDACJA PRZED KONTYNUOWANIEM ===
      const errors: string[] = []
      
      // Sprawdzenie wymaganych pól
      if (!formData.firstName.trim()) errors.push("Imię jest wymagane")
      if (!formData.lastName.trim()) errors.push("Nazwisko jest wymagane")
      if (!formData.email.trim()) errors.push("Email jest wymagany")
      if (!formData.position.trim()) errors.push("Stanowisko jest wymagane")
      if (!formData.experience.trim()) errors.push("Doświadczenie jest wymagane")
      if (!formData.skills.trim()) errors.push("Umiejętności są wymagane")
      if (!formData.cvFile) errors.push("Plik CV jest wymagany")
      
      // Sprawdzenie formatu email
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errors.push("Nieprawidłowy format email")
      }
      
      // Sprawdzenie doświadczenia
      const validExperience = ["junior", "mid", "senior", "lead"]
      if (formData.experience && !validExperience.includes(formData.experience)) {
        errors.push("Nieprawidłowe doświadczenie (wybierz z listy)")
      }
      
      // Sprawdzenie długości pól
      if (formData.firstName.trim().length > 50) errors.push("Imię jest zbyt długie (max 50 znaków)")
      if (formData.lastName.trim().length > 50) errors.push("Nazwisko jest zbyt długie (max 50 znaków)")
      if (formData.position.trim().length > 100) errors.push("Stanowisko jest zbyt długie (max 100 znaków)")
      if (formData.skills.trim().length > 500) errors.push("Umiejętności są zbyt długie (max 500 znaków)")
      if (formData.education.trim().length > 200) errors.push("Wykształcenie jest zbyt długie (max 200 znaków)")
      
      // Walidacja pliku CV
      if (formData.cvFile) {
        const allowedTypes = [
          "application/pdf", 
          "application/msword", 
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ]
        
        if (formData.cvFile.size > 10 * 1024 * 1024) {
          errors.push("Plik CV jest zbyt duży (max 10MB)")
        }
        
        if (!allowedTypes.includes(formData.cvFile.type)) {
          errors.push("Nieprawidłowy format pliku CV (tylko PDF, DOC, DOCX)")
        }
      }
      
      // Jeśli są błędy walidacji, STOP - nie kontynuuj
      if (errors.length > 0) {
        toast.error(errors.join(". "))
        setIsSubmitting(false)
        return
      }

      // 1) First upload CV to Supabase Storage
      if (!formData.cvFile) {
        throw new Error("Brak pliku CV do przesłania")
      }
      
      const uploadFd = new FormData()
      uploadFd.set("cv", formData.cvFile)
      
      const uploadRes = await fetch("/api/candidate/uploads", { 
        method: "POST", 
        body: uploadFd 
      })
      
      if (!uploadRes.ok) {
        const data = await uploadRes.json().catch(() => ({}))
        throw new Error(data?.error || "Nie udało się przesłać pliku CV")
      }
      
      const { bucket, key, hash, size, type, name } = await uploadRes.json()

      // 2) Create application with basic metadata only (no storage fields until DB migration)
      const applicationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        position: formData.position,
        experience: formData.experience,
        skills: formData.skills,
        education: formData.education || undefined,
        cvFileName: name,
        cvFileType: type,
        cvFileSize: size,
        // NOTE: Temporarily omitting storage fields until DB migration is complete
        // storageBucket: bucket,
        // storageKey: key,
        // fileHash: hash,
      }

      const res = await fetch("/api/candidate/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applicationData),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "Nie udało się przesłać zgłoszenia")
      }

      toast.success("CV przesłane pomyślnie")
      setSubmitStatus("success")
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || "Wystąpił błąd")
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const validateStep1 = (): boolean => {
    const errors: string[] = []
    
    if (!formData.firstName.trim()) errors.push("Imię jest wymagane")
    if (!formData.lastName.trim()) errors.push("Nazwisko jest wymagane")
    if (!formData.email.trim()) errors.push("Email jest wymagany")
    if (!formData.phone.trim()) errors.push("Telefon jest wymagany")
    
    // Sprawdzenie formatu email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.push("Nieprawidłowy format email")
    }
    
    // Sprawdzenie długości pól
    if (formData.firstName.trim().length > 50) errors.push("Imię jest zbyt długie (max 50 znaków)")
    if (formData.lastName.trim().length > 50) errors.push("Nazwisko jest zbyt długie (max 50 znaków)")
    
    if (errors.length > 0) {
      toast.error(errors.join(". "))
      return false
    }
    return true
  }

  const validateStep2 = (): boolean => {
    const errors: string[] = []
    
    if (!formData.position.trim()) errors.push("Stanowisko jest wymagane")
    if (!formData.experience.trim()) errors.push("Doświadczenie jest wymagane")
    if (!formData.skills.trim()) errors.push("Umiejętności są wymagane")
    
    // Sprawdzenie doświadczenia
    const validExperience = ["junior", "mid", "senior", "lead"]
    if (formData.experience && !validExperience.includes(formData.experience)) {
      errors.push("Nieprawidłowe doświadczenie (wybierz z listy)")
    }
    
    // Sprawdzenie długości pól
    if (formData.position.trim().length > 100) errors.push("Stanowisko jest zbyt długie (max 100 znaków)")
    if (formData.skills.trim().length > 500) errors.push("Umiejętności są zbyt długie (max 500 znaków)")
    if (formData.education.trim().length > 200) errors.push("Wykształcenie jest zbyt długie (max 200 znaków)")
    
    if (errors.length > 0) {
      toast.error(errors.join(". "))
      return false
    }
    return true
  }

  const validateStep3 = (): boolean => {
    const errors: string[] = []
    
    if (!formData.cvFile) {
      errors.push("Plik CV jest wymagany")
    } else {
      const allowedTypes = [
        "application/pdf", 
        "application/msword", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ]
      
      if (formData.cvFile.size > 10 * 1024 * 1024) {
        errors.push("Plik CV jest zbyt duży (max 10MB)")
      }
      
      if (!allowedTypes.includes(formData.cvFile.type)) {
        errors.push("Nieprawidłowy format pliku CV (tylko PDF, DOC, DOCX)")
      }
    }
    
    if (errors.length > 0) {
      toast.error(errors.join(". "))
      return false
    }
    return true
  }

  const nextStep = () => {
    // Walidacja przed przejściem do następnego kroku
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  if (submitStatus === "success") {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="font-heading font-bold text-2xl mb-4">CV zostało przesłane pomyślnie!</h2>
          <p className="text-muted-foreground mb-6">
            Twoje CV zostało przesłane i jest obecnie analizowane przez nasz system AI. Otrzymasz powiadomienie email
            gdy znajdziemy odpowiednie oferty pracy.
          </p>
          <Button onClick={() => window.location.reload()}>Prześlij kolejne CV</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto border-2">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Prześlij swoje CV</CardTitle>
        <CardDescription>
          Krok {step} z 3 - Wypełnij formularz i prześlij swoje CV, aby znaleźć idealne oferty pracy
        </CardDescription>
        <div className="flex space-x-2 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-2 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg">Dane osobowe</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Imię</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Wprowadź swoje imię"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nazwisko</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Wprowadź swoje nazwisko"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="twoj.email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+48 123 456 789"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg">Doświadczenie zawodowe</h3>
            <div className="space-y-2">
              <Label htmlFor="position">Pożądane stanowisko</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange("position", e.target.value)}
                placeholder="np. Frontend Developer, Marketing Manager"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Doświadczenie zawodowe</Label>
              <Select value={formData.experience} onValueChange={(value) => handleInputChange("experience", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz poziom doświadczenia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Junior (0-2 lata)</SelectItem>
                  <SelectItem value="mid">Mid (2-5 lat)</SelectItem>
                  <SelectItem value="senior">Senior (5+ lat)</SelectItem>
                  <SelectItem value="lead">Lead/Manager (8+ lat)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Kluczowe umiejętności</Label>
              <Textarea
                id="skills"
                value={formData.skills}
                onChange={(e) => handleInputChange("skills", e.target.value)}
                placeholder="Wymień swoje najważniejsze umiejętności, oddzielając je przecinkami"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="education">Wykształcenie</Label>
              <Input
                id="education"
                value={formData.education}
                onChange={(e) => handleInputChange("education", e.target.value)}
                placeholder="np. Magister Informatyki, Uniwersytet Warszawski"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg">Prześlij CV</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="space-y-2">
                  <Label htmlFor="cv-upload" className="cursor-pointer">
                    <span className="text-primary hover:text-primary/80">Kliknij aby wybrać plik</span>
                    <span className="text-muted-foreground"> lub przeciągnij i upuść</span>
                  </Label>
                  <Input
                    id="cv-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <p className="text-sm text-muted-foreground">Obsługiwane formaty: PDF, DOC, DOCX (max. 10MB)</p>
                </div>
              </div>

              {formData.cvFile && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Wybrany plik: {formData.cvFile.name} ({Math.round(formData.cvFile.size / 1024)} KB)
                  </AlertDescription>
                </Alert>
              )}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Twoje CV zostanie przeanalizowane przez nasz system AI w celu dopasowania do odpowiednich ofert pracy.
                  Wszystkie dane są przetwarzane zgodnie z RODO.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={prevStep} disabled={step === 1} className="bg-transparent">
            Wstecz
          </Button>

          {step < 3 ? (
            <Button onClick={nextStep}>
              Dalej
            </Button>
          ) : (
            <Button 
              onClick={() => {
                if (validateStep3()) {
                  handleSubmit()
                }
              }} 
              disabled={isSubmitting} 
              className="min-w-[140px]"
            >
              {isSubmitting ? "Przesyłanie..." : "Prześlij CV"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
