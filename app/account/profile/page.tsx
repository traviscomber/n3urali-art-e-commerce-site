"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Calendar, Shield, Save, Upload, ArrowLeft, Settings } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/contexts/auth-context"
import Link from "next/link"

interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  is_admin: boolean
}

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    avatar_url: "",
  })

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile")
      const result = await response.json()

      if (response.ok) {
        setProfile(result.user)
        setFormData({
          full_name: result.user.full_name || "",
          avatar_url: result.user.avatar_url || "",
        })
      } else {
        toast.error(result.error || "Failed to load profile")
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      toast.error("Full name is required")
      return
    }

    setSaving(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setProfile(result.user)
        toast.success("Profile updated successfully")
      } else {
        toast.error(result.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Please sign in</h3>
            <p className="text-muted-foreground mb-4">You need to be signed in to view your profile</p>
            <Button asChild>
              <Link href="/">Go to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-20 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
        <p className="text-muted-foreground">Manage your account information and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal information and avatar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="text-lg">
                  {profile?.full_name?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Change Avatar
                </Button>
                <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
              </div>
            </div>

            <Separator />

            {/* Form Fields */}
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" value={profile?.email || ""} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar_url">Avatar URL (Optional)</Label>
                <Input
                  id="avatar_url"
                  name="avatar_url"
                  value={formData.avatar_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Details
            </CardTitle>
            <CardDescription>Your account status and permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Email</span>
              </div>
              <span className="text-sm font-medium">{profile?.email}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Account Type</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">Developer Mode</Badge>
                {profile?.is_admin && <Badge variant="default">Admin</Badge>}
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium">Security Settings</h4>
                <p className="text-xs text-muted-foreground">Manage your password and security preferences</p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/account/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
