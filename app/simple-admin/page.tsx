"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function SimpleAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = () => {
    if (password === "C4rlit0s") {
      setIsAuthenticated(true)
      toast.success("Admin access granted")
    } else {
      toast.error("Invalid password")
    }
  }

  const handleImageUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    if (!mounted || typeof window === "undefined") return

    try {
      const supabase = createClient()

      const imageData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        price: Number.parseFloat(formData.get("price") as string),
        file_url: formData.get("file_url") as string,
        preview_url: formData.get("preview_url") as string,
        thumbnail_url: formData.get("thumbnail_url") as string,
        active: true,
        featured: false,
      }

      const { error } = await supabase.from("images").insert([imageData])

      if (error) throw error

      toast.success("Image added successfully!")
      e.currentTarget.reset()
    } catch (error) {
      console.error("Error adding image:", error)
      toast.error("Failed to add image")
    }
  }

  if (!mounted) {
    return <div className="p-8">Loading...</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>Enter admin password to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Simple Admin Panel</h1>
          <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
            Logout
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Add Image Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Image</CardTitle>
              <CardDescription>Upload a new 360° or fisheye image</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleImageUpload} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <select id="category" name="category" className="w-full p-2 border rounded-md" required>
                    <option value="">Select category</option>
                    <option value="360">360° Images</option>
                    <option value="fisheye">Fisheye Images</option>
                    <option value="panoramic">Panoramic</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input id="price" name="price" type="number" step="0.01" required />
                </div>

                <div>
                  <Label htmlFor="file_url">Image URL</Label>
                  <Input id="file_url" name="file_url" type="url" required />
                </div>

                <div>
                  <Label htmlFor="preview_url">Preview URL</Label>
                  <Input id="preview_url" name="preview_url" type="url" />
                </div>

                <div>
                  <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                  <Input id="thumbnail_url" name="thumbnail_url" type="url" />
                </div>

                <Button type="submit" className="w-full">
                  Add Image
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common admin tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => window.open("/gallery", "_blank")}
              >
                View Gallery
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => toast.info("Feature coming soon")}
              >
                Manage Orders
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => toast.info("Feature coming soon")}
              >
                View Analytics
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => toast.info("Feature coming soon")}
              >
                Export Data
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm">
              <p>This is a simplified admin interface that avoids build-time issues.</p>
              <ul>
                <li>Use the form above to add new images to your gallery</li>
                <li>Make sure to upload images to your hosting service first, then paste the URLs</li>
                <li>Categories help organize your images (360°, fisheye, panoramic)</li>
                <li>All images are automatically set as active when added</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
