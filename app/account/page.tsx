"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Settings, Download, ShoppingBag, ArrowRight, Calendar, Mail } from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import Link from "next/link"

interface UserStats {
  totalOrders: number
  totalDownloads: number
  accountCreated: string
}

export default function AccountPage() {
  const { user, isAuthenticated } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserStats()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const fetchUserStats = async () => {
    try {
      // Mock stats for now - in real app would fetch from API
      setStats({
        totalOrders: 5,
        totalDownloads: 12,
        accountCreated: "2024-01-15",
      })
    } catch (error) {
      console.error("Error fetching user stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Please sign in</h3>
            <p className="text-muted-foreground mb-4">You need to be signed in to view your account</p>
            <Button asChild>
              <Link href="/">Go to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Account</h1>
        <p className="text-muted-foreground">Manage your account, orders, and downloads</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Overview */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Overview
            </CardTitle>
            <CardDescription>Your account information and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Email</span>
              </div>
              <span className="text-sm font-medium">{user?.email}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Member since</span>
              </div>
              <span className="text-sm font-medium">
                {stats?.accountCreated ? new Date(stats.accountCreated).toLocaleDateString() : "Loading..."}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Account Status</span>
              <div className="flex gap-2">
                <Badge variant="secondary">Active</Badge>
                {user?.user_metadata?.is_admin && <Badge variant="default">Admin</Badge>}
              </div>
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button variant="outline" asChild>
                <Link href="/account/profile">
                  Edit Profile
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Your activity summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats?.totalOrders || 0}</div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats?.totalDownloads || 0}</div>
              <div className="text-sm text-muted-foreground">Downloads</div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
              <Link href="/account/orders">
                <ShoppingBag className="h-4 w-4 mr-2" />
                View Orders
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
              <Link href="/account/downloads">
                <Download className="h-4 w-4 mr-2" />
                My Downloads
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
              <Link href="/account/settings">
                <Settings className="h-4 w-4 mr-2" />
                Account Settings
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest orders and downloads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
              <Button variant="outline" className="mt-4 bg-transparent" asChild>
                <Link href="/browse">Browse Gallery</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
