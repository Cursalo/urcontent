'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChange, type AuthUser } from '@/lib/auth'
import { getUserProfile } from '@bonsai/database'
import type { User } from '@bonsai/shared'

interface AuthContextType {
  user: AuthUser
  profile: User | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async () => {
    if (user?.id) {
      try {
        const userProfile = await getUserProfile(user.id)
        setProfile(userProfile)
      } catch (error) {
        console.error('Error fetching user profile:', error)
        setProfile(null)
      }
    } else {
      setProfile(null)
    }
  }

  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange(async (user) => {
      setUser(user)
      setLoading(false)
      
      if (user?.id) {
        await refreshProfile()
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    profile,
    loading,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}