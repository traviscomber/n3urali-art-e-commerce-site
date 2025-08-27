"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Users, UserCheck, Shield, Loader2, Eye, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export const dynamic = "force-dynamic"

interface UserProfile {
  id: string
  email: string
  is_admin: boolean
  created_at: string
  updated_at: string
  orders?: {
    id: number
    total_amount: number
    status: string
  }[]
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    activeUsers: 0,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    loadUsers()
  }, [mounted])

  const loadUsers = async () => {
    if (!mounted) return

    const supabase = createClient()
    if (!supabase) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select(`
          *,
          orders (
            id,
            total_amount,
            status
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      const usersData = data || []
      setUsers(usersData)

      // Calculate stats
      setStats({
        totalUsers: usersData.length,
        adminUsers: usersData.filter((user) => user.is_admin).length,
        activeUsers: usersData.filter((user) => user.orders && user.orders.length > 0).length,
      })
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAdminStatus = async (userId: string, isAdmin: boolean) => {
    const supabase = createClient()
    if (!supabase) return

    try {
      setIsUpdating(true)
      const { error } = await supabase
        .from("user_profiles")
        .update({ is_admin: !isAdmin, updated_at: new Date().toISOString() })
        .eq("id", userId)

      if (error) throw error

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, is_admin: !isAdmin, updated_at: new Date().toISOString() } : user,
        ),
      )

      setSelectedUser(null)

      // Recalculate stats
      const updatedUsers = users.map((user) => (user.id === userId ? { ...user, is_admin: !isAdmin } : user))
      setStats((prev) => ({
        ...prev,
        adminUsers: updatedUsers.filter((user) => user.is_admin).length,
      }))
    } catch (error) {
      console.error("Error updating user:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredUsers = users.filter((user) => user.email.toLowerCase().includes(searchTerm.toLowerCase()))

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading users...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
        <p className="text-muted-foreground">Manage user accounts and permissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.adminUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{user.email}</div>
                  <div className="text-sm text-muted-foreground">
                    {user.orders ? `${user.orders.length} orders` : "No orders"} • Joined{" "}
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                  {user.orders && user.orders.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Total spent: ${user.orders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {user.is_admin && (
                    <Badge variant="default">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                        disabled={user.email === "admin@n3urali.art"} // Prevent removing admin from main admin
                      >
                        {user.is_admin ? "Remove Admin" : "Make Admin"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && <div className="text-center py-8 text-muted-foreground">No users found</div>}
          </div>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>User account information and activity</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <div className="flex items-center gap-2">
                    {selectedUser.is_admin ? (
                      <Badge variant="default">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary">User</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Joined</label>
                  <p className="text-sm text-muted-foreground">{new Date(selectedUser.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Last Updated</label>
                  <p className="text-sm text-muted-foreground">{new Date(selectedUser.updated_at).toLocaleString()}</p>
                </div>
              </div>

              {selectedUser.orders && selectedUser.orders.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Order History</label>
                  <div className="mt-2 space-y-2">
                    {selectedUser.orders.map((order) => (
                      <div key={order.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">Order #{order.id}</p>
                          <Badge
                            variant={
                              order.status === "completed"
                                ? "default"
                                : order.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <p className="font-medium">${order.total_amount.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Total orders: {selectedUser.orders.length} • Total spent: $
                    {selectedUser.orders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}
                  </div>
                </div>
              )}

              {selectedUser.email !== "admin@n3urali.art" && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => toggleAdminStatus(selectedUser.id, selectedUser.is_admin)}
                    disabled={isUpdating}
                    variant={selectedUser.is_admin ? "destructive" : "default"}
                  >
                    {isUpdating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {selectedUser.is_admin ? "Remove Admin Access" : "Grant Admin Access"}
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
