"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, RefreshCw } from "lucide-react"
import { useState } from "react"

export default function EmailVerificationFailedPage() {
  const [isResending, setIsResending] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get("error") || "Email verification failed"

  const handleResendEmail = async () => {
    setIsResending(true)
    // This would need user info - in a real app, you'd get this from the URL or session
    // For now, redirect to a resend page
    router.push("/auth/resend-verification")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-red-800">Verification Failed</CardTitle>
          <CardDescription>There was a problem verifying your email address</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <XCircle className="h-16 w-16 text-red-600 mx-auto" />

          <div className="space-y-2">
            <p className="text-red-700 font-medium">{error}</p>
            <p className="text-sm text-gray-600">
              This could happen if the verification link has expired or has already been used.
            </p>
          </div>

          <div className="space-y-3">
            <Button onClick={handleResendEmail} disabled={isResending} className="w-full">
              {isResending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Resending...
                </>
              ) : (
                "Request New Verification Email"
              )}
            </Button>

            <Button onClick={() => router.push("/auth/login")} variant="outline" className="w-full">
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
