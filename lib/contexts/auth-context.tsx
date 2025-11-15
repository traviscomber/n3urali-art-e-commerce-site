"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = useMemo(() => {
    try {
      return createClient()
    } catch (error) {
      console.error("[v0] Failed to create Supabase client:", error)
      return null
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      console.warn("[v0] Supabase client not available, skipping auth")
      setIsLoading(false)
      return
    }

    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error("[v0] Failed to get initial session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = async () => {
    if (!supabase) {
      console.warn("[v0] Cannot sign out: Supabase client not available")
      return
    }

    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("[v0] Failed to sign out:", error)
    }
  }

  const contextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signOut,
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
