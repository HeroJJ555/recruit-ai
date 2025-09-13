"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
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
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className={cn("flex flex-col bg-sidebar border-r border-sidebar-border", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="bg-sidebar-primary rounded-lg p-2">
              <Brain className="h-6 w-6 text-sidebar-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg text-sidebar-foreground">RecruitAI</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

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

      {/* User Profile */}
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="bg-sidebar-primary rounded-full p-2">
              <Users className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Anna Kowalska</p>
              <p className="text-xs text-sidebar-foreground/70 truncate">Rekruter Senior</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
