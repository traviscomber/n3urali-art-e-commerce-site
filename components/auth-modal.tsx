"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertTriangle, CheckCircle, Zap, Database } from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: "login" | "signup"
}

export function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const { signIn, quickDevMode } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null)
  const [showLocalAuth, setShowLocalAuth] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: "travis@nuanu.com", password: "" })
  const [signupForm, setSignupForm] = useState({ email: "", password: "", fullName: "" })

  const handleDevLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    console.log("[v0] Starting dev login process with context")

    setTimeout(() => {
      signIn(loginForm.email, loginForm.email.split("@")[0])

      setMessage({ type: "success", text: "✅ Successfully signed in! You now have admin access." })
      setTimeout(() => {
        console.log("[v0] Closing modal after successful context login")
        onClose()
      }, 1500)
      setIsLoading(false)
    }, 500)
  }

  const handleDevSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      signIn(signupForm.email, signupForm.fullName)

      setMessage({ type: "success", text: "✅ Account created! You now have admin access." })
      setTimeout(() => {
        onClose()
      }, 1500)
      setIsLoading(false)
    }, 500)
  }

  const handleQuickDevMode = () => {
    console.log("[v0] Starting quick dev mode with context")

    quickDevMode()

    setMessage({ type: "success", text: "✅ Developer mode activated! You now have full admin access." })
    setTimeout(() => {
      console.log("[v0] Quick mode - Closing modal after context activation")
      onClose()
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to n3urali.art</DialogTitle>
        </DialogHeader>

        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
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

          <Button onClick={handleQuickDevMode} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
            <Zap className="mr-2 h-4 w-4" />
            Continue in Developer Mode
          </Button>

          <div className="text-center">
            <Button variant="ghost" size="sm" onClick={() => setShowLocalAuth(!showLocalAuth)}>
              {showLocalAuth ? "Hide" : "Show"} Local Authentication
            </Button>
          </div>
        </div>

        {showLocalAuth && (
          <div className="mt-4">
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Local authentication mode - no database connection required.
              </AlertDescription>
            </Alert>

            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleDevLogin} className="space-y-4">
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
                      placeholder="Any password works in dev mode"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Sign In (Developer Mode)
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleDevSignup} className="space-y-4">
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
                      placeholder="Any password works in dev mode"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Sign Up (Developer Mode)
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
