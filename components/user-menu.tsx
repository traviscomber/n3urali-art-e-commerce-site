"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Download, Settings, LogOut, Shield, CheckCircle } from 'lucide-react'
import { AuthModal } from "./auth-modal"
import { useAuth } from "@/lib/contexts/auth-context"
import { useRouter } from 'next/navigation'

export function UserMenu() {
  const { user, isAuthenticated, signOut, isLoading } = useAuth()
  const router = useRouter()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  const handleAdminDashboard = () => {
    router.push("/admin/upload-video")
  }

  const handleProfile = () => {
    router.push("/account/profile")
  }

  const handleDownloads = () => {
    router.push("/account/downloads")
  }

  const handleSettings = () => {
    router.push("/account/settings")
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.email) {
        try {
          const { createClient } = await import("@/lib/supabase/client")
          const supabase = createClient()

          const { data: profile } = await supabase.from("profiles").select("role").eq("email", user.email).single()

          setIsAdmin(profile?.role === "admin" || user.email === "travis@nuanu.com")
        } catch (error) {
          setIsAdmin(user.email === "travis@nuanu.com")
        }
      }
    }

    if (isAuthenticated && user) {
      checkAdminStatus()
    }
  }, [user, isAuthenticated])

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      </Button>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <>
        <Button
          variant="outline"
          onClick={() => setIsAuthModalOpen(true)}
          className="bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white"
        >
          Sign In
        </Button>
        {/* </CHANGE> */}
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user.email || "")}
            </AvatarFallback>
          </Avatar>
          {isAuthenticated && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm">{user.user_metadata?.full_name || "User"}</p>
              {isAuthenticated && <CheckCircle className="w-3 h-3 text-green-500" />}
            </div>
            <p className="w-[200px] truncate text-xs text-muted-foreground">{user.email}</p>
            {isAdmin && (
              <Badge variant="default" className="text-xs bg-primary text-primary-foreground">
                Admin Access
              </Badge>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfile}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloads}>
          <Download className="mr-2 h-4 w-4" />
          <span>My Downloads</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSettings}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleAdminDashboard}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin Panel</span>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
        {/* </CHANGE> */}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
