"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Brain, Users, FileText, LogOut, LogIn } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession, signIn, signOut } from "next-auth/react"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session } = useSession()

  const initials = (session?.user?.name || "")
    .split(" ")
    .filter(Boolean)
    .map((s: string) => s[0] ?? "")
    .join("") || "U"

  return (
    <nav className="bg-background/80 backdrop-blur border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-primary rounded-lg p-2">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-xl text-foreground">RecruitAI</span>
          </Link>

          {/* Right side */}
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

            {/* Auth */}
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.image || undefined} alt={session.user.name || "Użytkownik"} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="max-w-[220px] truncate">
                    {session.user.name || session.user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                    <LogOut className="mr-2 h-4 w-4" /> Wyloguj
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" onClick={() => signIn(undefined, { callbackUrl: "/" })}>
                <LogIn className="mr-2 h-4 w-4" /> Zaloguj
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <Link
                href="/candidate"
                className="text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                <Button variant="outline" className="w-full flex items-center justify-center space-x-2 bg-transparent">
                  <FileText className="h-4 w-4" />
                  <span>Panel Kandydata</span>
                </Button>
              </Link>
              <Link
                href="/recruiter"
                className="text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                <Button className="w-full flex items-center justify-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Panel Rekrutera</span>
                </Button>
              </Link>
              <div className="pt-2 border-t border-border">
                {session?.user ? (
                  <Button variant="ghost" className="w-full" onClick={() => { setIsMenuOpen(false); signOut({ callbackUrl: "/" }) }}>
                    <LogOut className="mr-2 h-4 w-4" /> Wyloguj
                  </Button>
                ) : (
                  <Button variant="ghost" className="w-full" onClick={() => { setIsMenuOpen(false); signIn(undefined, { callbackUrl: "/" }) }}>
                    <LogIn className="mr-2 h-4 w-4" /> Zaloguj
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
