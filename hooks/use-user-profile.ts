"use client"
import { useEffect, useState } from 'react'
import { getCachedUserProfile, subscribeUserProfile, broadcastUserProfile } from '@/lib/user-profile-sync'
import { useSession } from 'next-auth/react'

interface ProfileState { name?: string | null; image?: string | null }

export function useUserProfile(): [ProfileState, (p: Partial<ProfileState>) => void] {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<ProfileState>(() => {
    const cached = getCachedUserProfile()
    return cached || { name: session?.user?.name, image: session?.user?.image }
  })

  // Sync with initial session if no cache yet
  useEffect(() => {
    if (!getCachedUserProfile() && (session?.user?.name || session?.user?.image)) {
      broadcastUserProfile({ name: session.user.name, image: session.user.image || undefined })
    }
  }, [session?.user?.name, session?.user?.image])

  useEffect(() => {
    return subscribeUserProfile(p => setProfile({ name: p.name, image: p.image }))
  }, [])

  const update = (partial: Partial<ProfileState>) => {
    broadcastUserProfile(partial)
  }

  return [profile, update]
}