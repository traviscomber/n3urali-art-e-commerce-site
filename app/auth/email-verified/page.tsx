"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function EmailVerifiedPage() {
  const router = useRouter()

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      router.push("/auth/login?verified=true")
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-800">Email Verified!</CardTitle>
          <CardDescription>Your email address has been successfully verified</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <CheckCircle className="h-20 w-20 text-green-600 mx-auto" />

          <div className="space-y-2">
            <p className="text-green-700 font-medium">Welcome to N3urali.art!</p>
            <p className="text-sm text-gray-600">You can now access all features of your account.</p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push("/auth/login?verified=true")}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Continue to Login
            </Button>
            <p className="text-xs text-gray-500">Redirecting automatically in 5 seconds...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
