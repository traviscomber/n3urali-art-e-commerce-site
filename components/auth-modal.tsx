"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertTriangle } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: "login" | "signup"
}

export function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null)
  const [showDevMode, setShowDevMode] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "failed">("checking")
  const supabase = createClient()

  useEffect(() => {
    if (isOpen && supabase) {
      testConnection()
    }
  }, [isOpen, supabase])

  const testConnection = async () => {
    try {
      // Try a simple query to test the connection
      const { error } = await supabase.from("_test_connection").select("*").limit(1)
      // Even if the table doesn't exist, we should get a proper error response, not a fetch error
      setConnectionStatus("connected")
    } catch (error) {
      console.error("[v0] Connection test failed:", error)
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        setConnectionStatus("failed")
      } else {
        setConnectionStatus("failed")
      }
    }
  }

  // Render the modal based on the connection status
  if (connectionStatus === "checking") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Checking Connection...</DialogTitle>
          </DialogHeader>
          <Loader2 className="animate-spin h-10 w-10 mx-auto" />
        </DialogContent>
      </Dialog>
    )
  }

  if (connectionStatus === "failed") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connection Failed</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to connect to Supabase. Please check your internet connection and try again.
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    )
  }

  // Render the login/signup tabs if connected
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Authenticate</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue={defaultTab}>
          <TabsList>
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Signup</TabsTrigger>
          </TabsList>
          <TabsContent value="login">{/* Login form here */}</TabsContent>
          <TabsContent value="signup">{/* Signup form here */}</TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
