"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
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
import { User, Download, Settings, LogOut, Shield, CheckCircle } from "lucide-react"
import { AuthModal } from "./auth-modal"
import { useAuth } from "@/lib/contexts/auth-context"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function UserMenu() {
  const { user: contextUser, isAuthenticated, signOut: contextSignOut } = useAuth()
  const router = useRouter()

  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDevMode, setIsDevMode] = useState(false)

  const [supabase] = useState(() => createClient())

  useEffect(() => {
    console.log("[v0] UserMenu useEffect starting")

    if (isAuthenticated && contextUser) {
      console.log("[v0] Context user found:", contextUser)

      const mockUser: SupabaseUser = {
        id: contextUser.id,
        email: contextUser.email,
        user_metadata: contextUser.user_metadata,
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
        role: "authenticated",
        updated_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        identities: [],
      }

      console.log("[v0] Created mock user from context:", mockUser)
      setUser(mockUser)
      setIsDevMode(true)
      setIsLoading(false)
      return
    }

    console.log("[v0] No context user, falling back to Supabase authentication")
    // Fall back to Supabase authentication
    if (!supabase) {
      console.log("[v0] No Supabase client available")
      setIsLoading(false)
      return
    }

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase, isAuthenticated, contextUser])

  const handleSignOut = async () => {
    if (isDevMode && contextUser) {
      console.log("[v0] Signing out from context")
      contextSignOut()
      setUser(null)
      setIsDevMode(false)
      return
    }

    if (!supabase) return
    await supabase.auth.signOut()
    window.location.reload()
  }

  const handleAdminDashboard = () => {
    router.push("/simple-admin")
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  const isAdmin =
    user?.email === "admin@n3urali.art" ||
    user?.email === "travis@nuanu.com" ||
    (isDevMode && user?.user_metadata?.is_admin === true)

  if (!supabase && !isDevMode) {
    return (
      <Button variant="outline" disabled className="bg-transparent">
        Auth Disabled
      </Button>
    )
  }

  if (isLoading) {
    return <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
  }

  if (!user) {
    return (
      <>
        <Button variant="outline" onClick={() => setIsAuthModalOpen(true)} className="bg-transparent">
          Sign In
        </Button>
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
            {isDevMode && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                Developer Mode
              </Badge>
            )}
            {isAdmin && (
              <Badge variant="default" className="text-xs bg-orange-100 text-orange-800">
                Admin Access
              </Badge>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Download className="mr-2 h-4 w-4" />
          <span>My Downloads</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleAdminDashboard}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin Dashboard</span>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
