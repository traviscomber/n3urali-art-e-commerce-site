"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef, useMemo } from "react"

interface User {
  id: string
  email: string
  user_metadata: {
    full_name: string
    is_admin: boolean
  }
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  signIn: (email: string, name?: string) => void
  signOut: () => void
  quickDevMode: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialState = useMemo(() => {
    if (typeof window === "undefined") return { user: null, isAuthenticated: false }

    try {
      const storedAuth = sessionStorage.getItem("dev_auth")
      const storedUser = sessionStorage.getItem("dev_user")

      if (storedAuth === "true" && storedUser) {
        return {
          user: JSON.parse(storedUser),
          isAuthenticated: true,
        }
      }
    } catch (error) {
      console.log("[v0] AuthProvider - Error reading initial state:", error)
    }

    return { user: null, isAuthenticated: false }
  }, [])

  const [user, setUser] = useState<User | null>(initialState.user)
  const [isAuthenticated, setIsAuthenticated] = useState(initialState.isAuthenticated)
  const isInitializedRef = useRef(false)

  useEffect(() => {
    if (isInitializedRef.current) {
      console.log("[v0] AuthProvider useEffect completed - State already initialized")
      return
    }

    console.log("[v0] AuthProvider useEffect starting...")
    isInitializedRef.current = true
    console.log("[v0] AuthProvider useEffect completed - State already initialized")
  }, [])

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated,
      signIn: (email: string, name?: string) => {
        console.log("[v0] AuthContext signIn called with:", { email, name })

        const userData: User = {
          id: `dev-user-${Date.now()}`,
          email,
          user_metadata: {
            full_name: name || email.split("@")[0],
            is_admin: true,
          },
        }

        console.log("[v0] AuthContext setting user:", userData)
        setUser(userData)
        setIsAuthenticated(true)

        try {
          sessionStorage.setItem("dev_auth", "true")
          sessionStorage.setItem("dev_user", JSON.stringify(userData))
          console.log("[v0] AuthContext - Persisted to sessionStorage")
        } catch (error) {
          console.log("[v0] AuthContext - Error persisting to sessionStorage:", error)
        }
      },
      quickDevMode: () => {
        console.log("[v0] AuthContext quickDevMode called")
        const userData: User = {
          id: `dev-user-${Date.now()}`,
          email: "developer@local.dev",
          user_metadata: {
            full_name: "Developer",
            is_admin: true,
          },
        }

        setUser(userData)
        setIsAuthenticated(true)

        try {
          sessionStorage.setItem("dev_auth", "true")
          sessionStorage.setItem("dev_user", JSON.stringify(userData))
        } catch (error) {
          console.log("[v0] AuthContext - Error persisting to sessionStorage:", error)
        }
      },
      signOut: () => {
        console.log("[v0] AuthContext signOut called")
        setUser(null)
        setIsAuthenticated(false)

        try {
          sessionStorage.removeItem("dev_auth")
          sessionStorage.removeItem("dev_user")
          console.log("[v0] AuthContext - Cleared sessionStorage")
        } catch (error) {
          console.log("[v0] AuthContext - Error clearing sessionStorage:", error)
        }
      },
    }),
    [user, isAuthenticated],
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
