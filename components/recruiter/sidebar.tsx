"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  FileText,
  Brain,
  BarChart3,
  Settings,
  MessageSquare,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/recruiter", icon: LayoutDashboard },
  { name: "Kandydaci", href: "/recruiter/candidates", icon: Users },
  { name: "Oferty pracy", href: "/recruiter/jobs", icon: FileText },
  { name: "Asystent AI", href: "/recruiter/ai-assistant", icon: Brain },
  { name: "Analityka", href: "/recruiter/analytics", icon: BarChart3 },
  { name: "Wiadomości", href: "/recruiter/messages", icon: MessageSquare },
  { name: "Wyszukiwanie", href: "/recruiter/search", icon: Search },
  { name: "Kalendarz", href: "/recruiter/calendar", icon: Calendar },
  { name: "Ustawienia", href: "/recruiter/settings", icon: Settings },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  // Sidebar always expanded now
  const collapsed = false
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <div className={cn("flex flex-col bg-sidebar border-r border-sidebar-border", className)}>
      {/* Header */}
      <Link href="/" aria-label="Przejdź do strony głównej" className="flex items-center p-4 border-b border-sidebar-border space-x-2">
        <div className="bg-sidebar-primary rounded-lg p-2">
          <Brain className="h-6 w-6 text-sidebar-primary-foreground" />
        </div>
        <span className="font-heading font-bold text-lg text-sidebar-foreground">RecruitAI</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center",
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Avatar + Hover / Click Menu */}
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 group">
                <Avatar className="h-10 w-10 ring-1 ring-sidebar-border group-hover:ring-sidebar-accent transition">
                  <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || 'avatar'} />
                  <AvatarFallback className="text-sm">
                    {(session?.user?.name || session?.user?.email || 'U')[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left overflow-hidden">
                  <span className="text-sm font-medium truncate">{session?.user?.name || session?.user?.email || 'Użytkownik'}</span>
                  <span className="text-xs text-sidebar-foreground/70 truncate">{session?.user?.email || ''}</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-56 mr-2">
              <DropdownMenuLabel className="truncate max-w-full">
                {session?.user?.name || session?.user?.email || 'Użytkownik'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/recruiter/settings">Ustawienia</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                Wyloguj
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}