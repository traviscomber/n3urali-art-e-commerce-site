"use client"

import { useState } from "react"
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

export function UserMenu() {
  const { user: contextUser, isAuthenticated, signOut: contextSignOut } = useAuth()
  const router = useRouter()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const handleSignOut = async () => {
    console.log("[v0] Signing out from context")
    contextSignOut()
  }

  const handleAdminDashboard = () => {
    router.push("/simple-admin")
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  const isAdmin = contextUser?.user_metadata?.is_admin === true

  if (!isAuthenticated || !contextUser) {
    return (
      <>
        <Button
          variant="outline"
          onClick={() => setIsAuthModalOpen(true)}
          className="bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white"
        >
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
              {getInitials(contextUser.email || "")}
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
              <p className="font-medium text-sm">{contextUser.user_metadata?.full_name || "User"}</p>
              {isAuthenticated && <CheckCircle className="w-3 h-3 text-green-500" />}
            </div>
            <p className="w-[200px] truncate text-xs text-muted-foreground">{contextUser.email}</p>
            <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
              Developer Mode
            </Badge>
            {isAdmin && (
              <Badge variant="default" className="text-xs bg-primary text-primary-foreground">
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
