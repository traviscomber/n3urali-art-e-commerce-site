"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("No verification token provided")
      return
    }

    verifyEmail(token)
  }, [token])

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage("Your email has been verified successfully!")

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/auth/login?verified=true")
        }, 3000)
      } else {
        setStatus("error")
        setMessage(data.error || "Email verification failed")
      }
    } catch (error) {
      console.error("Email verification error:", error)
      setStatus("error")
      setMessage("An error occurred during email verification")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
          <CardDescription>
            {status === "loading" && "Verifying your email address..."}
            {status === "success" && "Email verified successfully!"}
            {status === "error" && "Email verification failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "loading" && (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              <p className="text-green-700 font-medium">{message}</p>
              <p className="text-sm text-gray-600">Redirecting to login page in 3 seconds...</p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <XCircle className="h-16 w-16 text-red-600 mx-auto" />
              <p className="text-red-700 font-medium">{message}</p>
              <div className="space-y-2">
                <Button onClick={() => router.push("/auth/register")} variant="outline" className="w-full">
                  Back to Registration
                </Button>
                <Button onClick={() => router.push("/auth/login")} className="w-full">
                  Go to Login
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
