import Link from "next/link"
import { Brain, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-primary rounded-lg p-2">
                <Brain className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-xl">RecruitAI</span>
            </Link>
            <p className="text-muted-foreground">
              Nowoczesna platforma rekrutacyjna wykorzystująca sztuczną inteligencję do optymalizacji procesów HR.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>kontakt@recruitai.pl</span>
              </div>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg">Produkt</h3>
            <div className="space-y-2">
              <Link href="/features" className="block text-muted-foreground hover:text-foreground transition-colors">
                Funkcje
              </Link>
              <Link href="/pricing" className="block text-muted-foreground hover:text-foreground transition-colors">
                Cennik
              </Link>
              <Link href="/demo" className="block text-muted-foreground hover:text-foreground transition-colors">
                Demo
              </Link>
              <Link
                href="/integrations"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Integracje
              </Link>
            </div>
          </div>

          {/* For Users */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg">Dla Użytkowników</h3>
            <div className="space-y-2">
              <Link href="/recruiter" className="block text-muted-foreground hover:text-foreground transition-colors">
                Panel Rekrutera
              </Link>
              <Link href="/candidate" className="block text-muted-foreground hover:text-foreground transition-colors">
                Panel Kandydata
              </Link>
              <Link href="/help" className="block text-muted-foreground hover:text-foreground transition-colors">
                Pomoc
              </Link>
              <Link href="/tutorials" className="block text-muted-foreground hover:text-foreground transition-colors">
                Tutoriale
              </Link>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg">Firma</h3>
            <div className="space-y-2">
              <Link href="/about" className="block text-muted-foreground hover:text-foreground transition-colors">
                O nas
              </Link>
              <Link href="/careers" className="block text-muted-foreground hover:text-foreground transition-colors">
                Kariera
              </Link>
              <Link href="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">
                Kontakt
              </Link>
              <Link href="/privacy" className="block text-muted-foreground hover:text-foreground transition-colors">
                Polityka prywatności
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">© 2025 RecruitAI. Wszystkie prawa zastrzeżone.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/terms" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                Regulamin
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                Prywatność
              </Link>
              <Link href="/cookies" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}