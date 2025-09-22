"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: "user" | "admin" | "developer"
  is_active: boolean
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  isAuthenticated: boolean
  isAdmin: boolean
  isDeveloper: boolean
  isLoading: boolean
  signOut: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchProfile = async (userId: string) => {
    try {
      console.log("[v0] Fetching profile for user:", userId)

      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("[v0] Error fetching profile:", error)

        // If profile doesn't exist, create one
        if (error.code === "PGRST116") {
          console.log("[v0] Profile not found, creating new profile")
          const { data: userData } = await supabase.auth.getUser()

          const newProfile = {
            id: userId,
            email: userData.user?.email || "",
            full_name: userData.user?.user_metadata?.full_name || "User",
            role: userData.user?.email === "travis@nuanu.com" ? "admin" : "user",
            is_active: true,
          }

          const { data: createdProfile, error: createError } = await supabase
            .from("profiles")
            .insert(newProfile)
            .select("*")
            .single()

          if (createError) {
            console.error("[v0] Error creating profile:", createError)
            return newProfile as UserProfile
          }

          return createdProfile as UserProfile
        }

        return null
      }

      console.log("[v0] Profile fetched successfully:", data)
      return data as UserProfile
    } catch (error) {
      console.error("[v0] Error in fetchProfile:", error)
      return null
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        setUser(session?.user ?? null)

        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id)
          setProfile(userProfile)
        }

        setIsLoading(false)
      } catch (error) {
        console.error("[v0] Error getting initial session:", error)
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] Auth state changed:", event)
      setUser(session?.user ?? null)

      if (session?.user) {
        const userProfile = await fetchProfile(session.user.id)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }

      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signIn = async (email: string, password: string) => {
    try {
      console.log("[v0] Attempting sign in for:", email)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("[v0] Sign in error:", error)
        return { error: error.message }
      }

      console.log("[v0] Sign in successful")
      return {}
    } catch (error) {
      console.error("[v0] Sign in exception:", error)
      return { error: "An unexpected error occurred" }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/protected`,
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      return { error: "An unexpected error occurred" }
    }
  }

  const contextValue = useMemo(
    () => ({
      user,
      profile,
      isAuthenticated: !!user,
      isAdmin: profile?.role === "admin" || profile?.role === "developer",
      isDeveloper: profile?.role === "developer",
      isLoading,
      signOut: async () => {
        await supabase.auth.signOut()
      },
      signIn,
      signUp,
    }),
    [user, profile, isLoading, supabase.auth],
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
