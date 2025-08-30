"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertTriangle, CheckCircle, Zap, Database } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: "login" | "signup"
}

export function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null)
  const [showSupabaseAuth, setShowSupabaseAuth] = useState(false)
  const [failureCount, setFailureCount] = useState(0)

  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [signupForm, setSignupForm] = useState({ email: "", password: "", fullName: "" })

  const supabase = createClient()

  useEffect(() => {
    if (failureCount >= 2) {
      setMessage({
        type: "warning",
        text: "Supabase authentication is currently unavailable. Developer mode is recommended.",
      })
    }
  }, [failureCount])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return

    setIsLoading(true)
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      })

      if (error) {
        setMessage({ type: "error", text: error.message })
      } else if (data.user) {
        setMessage({ type: "success", text: "Successfully signed in!" })
        setTimeout(() => {
          onClose()
          window.location.reload()
        }, 1000)
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      setFailureCount((prev) => prev + 1)
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        setMessage({
          type: "warning",
          text: "Database connection unavailable. Please use Developer Mode to continue.",
        })
      } else {
        setMessage({ type: "error", text: "An unexpected error occurred" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return

    setIsLoading(true)
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
        options: {
          data: {
            full_name: signupForm.fullName,
          },
        },
      })

      if (error) {
        setMessage({ type: "error", text: error.message })
      } else if (data.user) {
        setMessage({
          type: "success",
          text: "Account created! Check your email for a confirmation link.",
        })
      }
    } catch (error) {
      console.error("[v0] Signup error:", error)
      setFailureCount((prev) => prev + 1)
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        setMessage({
          type: "warning",
          text: "Database connection unavailable. Please use Developer Mode to continue.",
        })
      } else {
        setMessage({ type: "error", text: "An unexpected error occurred" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDevMode = () => {
    localStorage.setItem("dev_auth", "true")
    localStorage.setItem(
      "dev_user",
      JSON.stringify({
        id: "dev-user",
        email: "developer@local.dev",
        user_metadata: { full_name: "Developer" },
      }),
    )
    setMessage({ type: "success", text: "Developer mode activated! Redirecting..." })
    setTimeout(() => {
      onClose()
      window.location.reload()
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to n3urali.art</DialogTitle>
        </DialogHeader>

        {message && (
          <Alert
            variant={message.type === "error" ? "destructive" : message.type === "warning" ? "default" : "default"}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : message.type === "warning" ? (
              <Database className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <Zap className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Quick Start:</strong> Database setup is in progress. Use Developer Mode to explore the site
              immediately while we configure your database.
            </AlertDescription>
          </Alert>

          <Button onClick={handleDevMode} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
            <Zap className="mr-2 h-4 w-4" />
            Continue in Developer Mode
          </Button>

          <div className="text-center">
            <Button variant="ghost" size="sm" onClick={() => setShowSupabaseAuth(!showSupabaseAuth)}>
              {showSupabaseAuth ? "Hide" : "Show"} Database Authentication
              {failureCount > 0 && <span className="ml-1 text-amber-600">({failureCount} failures)</span>}
            </Button>
          </div>
        </div>

        {showSupabaseAuth && (
          <div className="mt-4">
            {failureCount > 0 && (
              <Alert className="mb-4 border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Database authentication is currently experiencing issues. Developer mode is recommended.
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="travis@nuanu.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Sign In with Database
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your full name"
                      value={signupForm.fullName}
                      onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Choose a strong password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Sign Up with Database
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
