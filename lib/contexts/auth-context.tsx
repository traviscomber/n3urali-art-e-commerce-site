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
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  checkSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const isInitializedRef = useRef(false)

  useEffect(() => {
    if (isInitializedRef.current) {
      console.log("[v0] AuthProvider useEffect completed - State already initialized")
      return
    }

    console.log("[v0] AuthProvider useEffect starting...")
    checkSession().catch((error) => {
      console.error("[v0] AuthProvider initialization error:", error)
      setIsLoading(false)
    })
    isInitializedRef.current = true
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session")
      const data = await response.json()

      if (data.user) {
        setUser(data.user)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error("Session check failed:", error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      signIn: async (email: string, password: string) => {
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          })

          const data = await response.json()

          if (response.ok) {
            setUser(data.user)
            setIsAuthenticated(true)
            return { success: true }
          } else {
            return { success: false, error: data.error || "Login failed" }
          }
        } catch (error) {
          console.error("Login error:", error)
          return { success: false, error: "Network error. Please try again." }
        }
      },
      signUp: async (email: string, password: string, fullName: string) => {
        try {
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password, fullName }),
          })

          const data = await response.json()

          if (response.ok) {
            // Auto-login after successful registration
            const loginResult = await contextValue.signIn(email, password)
            return loginResult
          } else {
            return { success: false, error: data.error || "Registration failed" }
          }
        } catch (error) {
          console.error("Registration error:", error)
          return { success: false, error: "Network error. Please try again." }
        }
      },
      signOut: async () => {
        try {
          await fetch("/api/auth/session", {
            method: "DELETE",
          })
        } catch (error) {
          console.error("Logout error:", error)
        } finally {
          setUser(null)
          setIsAuthenticated(false)
        }
      },
      checkSession,
    }),
    [user, isAuthenticated, isLoading],
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
