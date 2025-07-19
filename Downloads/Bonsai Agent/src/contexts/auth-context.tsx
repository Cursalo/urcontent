'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChange, type AuthUser, supabase } from '@/lib/auth'

interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  subscription_tier?: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: AuthUser
  profile: UserProfile | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async () => {
    if (user?.id) {
      try {
        const { data: userProfile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (error) throw error
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