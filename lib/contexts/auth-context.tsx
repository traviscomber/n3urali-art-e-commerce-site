"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signOut: () => Promise<void>
  initializeAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)

  // Initialize Supabase client only in browser, not during render
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        setSupabase(createClient())
      }
    } catch (error) {
      // Silently fail - Supabase not available yet
      setSupabase(null)
    }
  }, [])

  const initializeAuth = useCallback(async () => {
    if (!supabase || isInitialized) {
      return
    }

    setIsLoading(true)
    setIsInitialized(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setUser(session?.user ?? null)

      // Subscribe to auth changes only after manual initialization
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user ?? null)
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      // Auth initialization failed silently
    } finally {
      setIsLoading(false)
    }
  }, [supabase, isInitialized])

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  const signOut = async () => {
    if (!supabase) {
      return
    }

    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      // Sign out failed silently
    }
  }

  const contextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signOut,
    initializeAuth,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
