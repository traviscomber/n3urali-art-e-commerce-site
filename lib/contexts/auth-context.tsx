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

  const supabase = useMemo(() => {
    try {
      return createClient()
    } catch (error) {
      console.error("[v0] Failed to create Supabase client:", error)
      return null
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

      console.log("[v0] Auth initialized:", {
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
      })

      setUser(session?.user ?? null)

      // Subscribe to auth changes only after manual initialization
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("[v0] Auth state changed:", {
          event,
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
        })
        setUser(session?.user ?? null)
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error("[v0] Failed to initialize auth:", error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, isInitialized])

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  const signOut = async () => {
    if (!supabase) {
      console.warn("[v0] Cannot sign out: Supabase client not available")
      return
    }

    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error("[v0] Failed to sign out:", error)
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
