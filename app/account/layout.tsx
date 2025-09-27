"use client"

import type React from "react"

import { AccountNav } from "@/components/account-nav"
import { useAuth } from "@/lib/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User } from "lucide-react"
import Link from "next/link"

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Please sign in</h3>
            <p className="text-muted-foreground mb-4">You need to be signed in to access your account</p>
            <Button asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64">
          <AccountNav />
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
