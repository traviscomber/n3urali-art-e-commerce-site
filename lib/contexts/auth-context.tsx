"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

// Extend the User type with custom properties
interface ExtendedUser extends User {
  is_admin?: boolean
}

interface AuthContextType {
  user: ExtendedUser | null
  isAuthenticated: boolean
  isLoading: boolean
  signOut: () => Promise<void>
  initializeAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null)
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

      if (session?.user) {
        // Check if user is admin from profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()

        const extendedUser: ExtendedUser = {
          ...session.user,
          is_admin: profile?.role === "admin",
        }
        setUser(extendedUser)
      } else {
        setUser(null)
      }

      // Subscribe to auth changes only after manual initialization
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          // Check if user is admin from profiles table
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single()

          const extendedUser: ExtendedUser = {
            ...session.user,
            is_admin: profile?.role === "admin",
          }
          setUser(extendedUser)
        } else {
          setUser(null)
        }
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
