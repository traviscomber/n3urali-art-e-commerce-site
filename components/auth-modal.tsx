"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertTriangle, CheckCircle, Zap } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: "login" | "signup"
}

export function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null)
  const [showSupabaseAuth, setShowSupabaseAuth] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [signupForm, setSignupForm] = useState({ email: "", password: "", fullName: "" })

  const supabase = createClient()

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
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        setMessage({
          type: "error",
          text: "Supabase connection failed. Please use Developer Mode below.",
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
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        setMessage({
          type: "error",
          text: "Supabase connection failed. Please use Developer Mode below.",
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
    setMessage({ type: "success", text: "Developer mode activated!" })
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
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              Database setup in progress. Use Developer Mode to continue using the site.
            </AlertDescription>
          </Alert>

          <Button onClick={handleDevMode} className="w-full" size="lg">
            <Zap className="mr-2 h-4 w-4" />
            Continue in Developer Mode
          </Button>

          <div className="text-center">
            <Button variant="ghost" size="sm" onClick={() => setShowSupabaseAuth(!showSupabaseAuth)}>
              {showSupabaseAuth ? "Hide" : "Show"} Supabase Authentication
            </Button>
          </div>
        </div>

        {showSupabaseAuth && (
          <Tabs defaultValue={defaultTab} className="w-full mt-4">
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
                  Sign In with Supabase
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
                  Sign Up with Supabase
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
