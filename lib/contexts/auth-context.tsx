"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
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
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)

  useEffect(() => {
    try {
      const client = createClient()
      setSupabase(client)
      console.log("[v0] Supabase client created successfully in AuthProvider")
    } catch (error) {
      console.error("[v0] Failed to create Supabase client in AuthProvider:", error)
      setIsLoading(false)
      return
    }
  }, [])

  useEffect(() => {
    if (!supabase) return

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        console.log("[v0] Initial session loaded:", session?.user ? "✓ User found" : "✗ No user")
      } catch (error) {
        console.error("[v0] Failed to get initial session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] Auth state changed:", event, session?.user ? "✓ User found" : "✗ No user")
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = async () => {
    if (!supabase) {
      console.error("[v0] Cannot sign out: Supabase client not available")
      return
    }

    try {
      await supabase.auth.signOut()
      console.log("[v0] User signed out successfully")
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
