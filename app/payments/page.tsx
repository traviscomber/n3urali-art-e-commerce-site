"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { PaymentsManager } from "@/components/admin/payments-manager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, DollarSign, ArrowLeft } from 'lucide-react'
import { createBrowserClient } from "@supabase/ssr"

export default function PaymentsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user?.email === "travis@nuanu.com") {
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error("[v0] Auth check error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password === "C4rlit0s") {
      setIsAuthenticated(true)
      setPassword("")
    } else {
      setError("Invalid password")
      setPassword("")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Loading...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-orange-600 flex items-center justify-center gap-2">
              <DollarSign className="h-8 w-8" />
              Payment Approvals
            </CardTitle>
            <CardDescription className="text-lg">Enter password to manage payments</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-lg font-medium">
                  Admin Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="mt-1 text-lg h-12"
                  autoFocus
                  required
                />
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-600 text-lg">{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-lg h-12">
                Access Payment Manager
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full text-lg h-12"
                onClick={() => router.push("/simple-admin")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Admin Panel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/simple-admin")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="h-8 w-8 text-orange-600" />
                Payment Approvals
              </h1>
              <p className="text-xl text-gray-600 font-medium">Manage USDT crypto payments and orders</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsAuthenticated(false)} 
            variant="outline" 
            className="text-lg h-12 px-6"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <PaymentsManager />
      </div>
    </div>
  )
}
