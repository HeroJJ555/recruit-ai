"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Brain, Users, FileText } from "lucide-react"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-primary rounded-lg p-2">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-xl text-foreground">RecruitAI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/features" className="text-muted-foreground hover:text-foreground transition-colors">
              Funkcje
            </Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Cennik
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              O nas
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Kontakt
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/candidate">
              <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <FileText className="h-4 w-4" />
                <span>Panel Kandydata</span>
              </Button>
            </Link>
            <Link href="/recruiter">
              <Button className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Panel Rekrutera</span>
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <Link
                href="/features"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Funkcje
              </Link>
              <Link
                href="/pricing"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Cennik
              </Link>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                O nas
              </Link>
              <Link
                href="/contact"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Kontakt
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                <Link href="/candidate" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full flex items-center space-x-2 bg-transparent">
                    <FileText className="h-4 w-4" />
                    <span>Panel Kandydata</span>
                  </Button>
                </Link>
                <Link href="/recruiter" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Panel Rekrutera</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
