"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"

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
  const getInitialUser = (): User | null => {
    if (typeof window === "undefined") return null
    try {
      const storedAuth = sessionStorage.getItem("dev_auth")
      const storedUser = sessionStorage.getItem("dev_user")
      if (storedAuth === "true" && storedUser) {
        return JSON.parse(storedUser)
      }
    } catch (error) {
      console.log("[v0] AuthProvider - Error reading initial state:", error)
    }
    return null
  }

  const getInitialAuth = (): boolean => {
    if (typeof window === "undefined") return false
    try {
      return sessionStorage.getItem("dev_auth") === "true"
    } catch (error) {
      return false
    }
  }

  const [user, setUser] = useState<User | null>(getInitialUser())
  const [isAuthenticated, setIsAuthenticated] = useState(getInitialAuth())
  const [isInitialized, setIsInitialized] = useState(false)
  const isInitializedRef = useRef(false)

  useEffect(() => {
    if (isInitializedRef.current) {
      console.log("[v0] AuthProvider - Already initialized, skipping")
      return
    }

    console.log("[v0] AuthProvider useEffect starting...")
    isInitializedRef.current = true

    setIsInitialized(true)
    console.log("[v0] AuthProvider useEffect completed - State already initialized")
  }, [])

  const signIn = (email: string, name?: string) => {
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
  }

  const quickDevMode = () => {
    console.log("[v0] AuthContext quickDevMode called")
    signIn("developer@local.dev", "Developer")
  }

  const signOut = () => {
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
  }

  if (!isInitialized) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        signIn,
        signOut,
        quickDevMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
