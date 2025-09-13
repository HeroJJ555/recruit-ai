"use client"
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import * as React from 'react'

interface Props {
  className?: string
  variant?: React.ComponentProps<typeof Button>["variant"]
  size?: React.ComponentProps<typeof Button>["size"]
  label?: string
  callbackUrl?: string
}

export function SignOutButton({ className, variant="outline", size="sm", label="Wyloguj", callbackUrl="/" }: Props) {
  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      onClick={() => signOut({ callbackUrl })}
      className={className + ' flex items-center gap-2'}
    >
      <LogOut className="h-4 w-4" /> {label}
    </Button>
  )
}