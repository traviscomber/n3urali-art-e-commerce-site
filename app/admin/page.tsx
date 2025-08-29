export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Images, Package, Download, ShoppingCart, Users, BarChart3, Eye, Edit } from "lucide-react"
import Image from "next/image"

export default async function AdminDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("user_profiles").select("is_admin").eq("id", user.id).single()

  if (!profile?.is_admin) {
    redirect("/")
  }

  const [imagesResult, ordersResult, downloadsResult, usersResult, recentImagesResult] = await Promise.all([
    supabase.from("images").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("download_logs").select("*", { count: "exact", head: true }),
    supabase.from("user_profiles").select("*", { count: "exact", head: true }),
    supabase.from("images").select("*").order("created_at", { ascending: false }).limit(6),
  ])

  const stats = {
    images: imagesResult.count || 0,
    orders: ordersResult.count || 0,
    downloads: downloadsResult.count || 0,
    users: usersResult.count || 0,
  }

  const { data: categoryStats } = await supabase
    .from("images")
    .select("category")
    .in("category", ["360", "fisheye", "equirectangular"])

  const categoryBreakdown =
    categoryStats?.reduce((acc: Record<string, number>, img) => {
      acc[img.category] = (acc[img.category] || 0) + 1
      return acc
    }, {}) || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your n3urali.art e-commerce platform</p>
        </div>
        <Badge variant="default">Admin Panel</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Images</CardTitle>
            <Images className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.images}</div>
            <div className="text-xs text-muted-foreground mt-1">
              360°: {categoryBreakdown["360"] || 0} | Fisheye: {categoryBreakdown["fisheye"] || 0} | Equirectangular:{" "}
              {categoryBreakdown["equirectangular"] || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.downloads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Images</CardTitle>
          <CardDescription>Latest 360° and fisheye images uploaded to your collection</CardDescription>
        </CardHeader>
        <CardContent>
          {recentImagesResult.data && recentImagesResult.data.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentImagesResult.data.map((image) => (
                <div key={image.id} className="border rounded-lg p-4 space-y-3">
                  <div className="aspect-video relative bg-muted rounded-md overflow-hidden">
                    {image.thumbnail_url ? (
                      <Image
                        src={image.thumbnail_url || "/placeholder.svg"}
                        alt={image.title || "Image"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Images className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm truncate">{image.title || "Untitled"}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {image.category || "uncategorized"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {image.description || "No description"}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{image.dimensions || "Unknown size"}</span>
                      <span>${image.price || "0.00"}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Images className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No images found. Upload your first 360° or fisheye image to get started.</p>
              <Link href="/admin/images">
                <Button className="mt-4">Upload Images</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Images className="h-5 w-5" />
              <CardTitle>Image Management</CardTitle>
            </div>
            <CardDescription>Upload, edit, and manage your 360° and fisheye images</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Manage {stats.images} images in your collection</p>
              <Link href="/admin/images">
                <Button className="w-full">Manage Images</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <CardTitle>Collections</CardTitle>
            </div>
            <CardDescription>Organize images into categories and collections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Create and manage image categories</p>
              <Link href="/admin/collections">
                <Button className="w-full">Manage Collections</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <CardTitle>Downloads</CardTitle>
            </div>
            <CardDescription>Track and manage customer downloads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{stats.downloads} total downloads tracked</p>
              <Link href="/admin/downloads">
                <Button className="w-full">View Downloads</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5" />
              <CardTitle>Orders</CardTitle>
            </div>
            <CardDescription>View and manage customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{stats.orders} orders processed</p>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <CardTitle>Users</CardTitle>
            </div>
            <CardDescription>Manage user accounts and profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{stats.users} registered users</p>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <CardTitle>Analytics</CardTitle>
            </div>
            <CardDescription>View sales and performance analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Track your business performance</p>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Content Management</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Upload new images to your collection</li>
                <li>• Create new image categories</li>
                <li>• Update image pricing and metadata</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">System Monitoring</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Monitor download activity</li>
                <li>• Track user registrations</li>
                <li>• Review order processing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
