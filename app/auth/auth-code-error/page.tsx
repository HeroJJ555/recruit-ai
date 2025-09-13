import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="font-heading font-bold text-2xl mb-4">Błąd uwierzytelniania</h2>
            <p className="text-muted-foreground mb-6">
              Wystąpił problem podczas weryfikacji Twojego konta. Link aktywacyjny może być nieprawidłowy lub wygasły.
            </p>
            <div className="space-y-3">
              <Link href="/auth/register">
                <Button className="w-full">Spróbuj ponownie</Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" className="w-full bg-transparent">
                  Przejdź do logowania
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
