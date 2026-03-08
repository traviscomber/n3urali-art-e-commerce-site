"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Eye, EyeOff } from "lucide-react"
import { getImages, createImageWithCategory } from "@/app/actions/admin-actions"

export default function SimpleAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [images, setImages] = useState<any[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [editingImage, setEditingImage] = useState<any>(null)

  const handleLogin = () => {
    if (password === "admin123") {
      setIsAuthenticated(true)
      localStorage.setItem("simple_admin_auth", "true")
      fetchData()
    } else {
      alert("Invalid password")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("simple_admin_auth")
  }

  useEffect(() => {
    if (localStorage.getItem("simple_admin_auth") === "true") {
      setIsAuthenticated(true)
      fetchData()
    }
  }, [])

  const fetchData = async () => {
    try {
      const imagesResult = await getImages()
      if (imagesResult.success) {
        setImages(imagesResult.data)
        // Extract unique categories from images
        const uniqueCategories = imagesResult.data.reduce((acc, image) => {
          if (image.category_name && !acc.find((cat) => cat.name === image.category_name)) {
            acc.push({ id: image.category_id, name: image.category_name })
          }
          return acc
        }, [])
        setCategories(uniqueCategories)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const [newImage, setNewImage] = useState({
    title: "",
    description: "",
    category_id: "",
    price: "",
    image_url: "",
    preview_url: "",
    file_size: "",
    dimensions: "",
    is_active: true,
    is_featured: false,
  })

  const handleImageSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const imageData = {
        title: newImage.title,
        description: newImage.description,
        category: categories.find((cat) => cat.id === newImage.category_id)?.name || "Uncategorized",
        price: Number.parseFloat(newImage.price) || 0,
        image_url: newImage.image_url,
        thumbnail_url: newImage.preview_url || newImage.image_url,
      }

      const result = await createImageWithCategory(imageData)

      if (result.success) {
        // Reset form
        setNewImage({
          title: "",
          description: "",
          category_id: "",
          price: "",
          image_url: "",
          preview_url: "",
          file_size: "",
          dimensions: "",
          is_active: true,
          is_featured: false,
        })
        setEditingImage(null)
        fetchData()
      } else {
        alert("Error saving image: " + result.error)
      }
    } catch (error) {
      console.error("Error saving image:", error)
      alert("Error saving image")
    }

    setLoading(false)
  }

  const handleEdit = (image) => {
    setEditingImage(image)
    setNewImage({
      title: image.title || "",
      description: image.description || "",
      category_id: image.category_id || "",
      price: image.price?.toString() || "",
      image_url: image.image_url || "",
      preview_url: image.preview_url || "",
      file_size: image.file_size?.toString() || "",
      dimensions: image.dimensions || "",
      is_active: image.is_active ?? true,
      is_featured: image.is_featured ?? false,
    })
  }

  const handleDelete = async (imageId) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    alert("Delete functionality needs to be implemented with server actions")
  }

  const toggleStatus = async (image, field) => {
    alert("Toggle functionality needs to be implemented with server actions")
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Enter admin password"
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Photo Admin</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingImage ? "Edit Photo" : "Add New Photo"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleImageSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newImage.title}
                  onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newImage.category_id}
                  onValueChange={(value) => setNewImage({ ...newImage, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newImage.price}
                  onChange={(e) => setNewImage({ ...newImage, price: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={newImage.image_url}
                  onChange={(e) => setNewImage({ ...newImage, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              <div>
                <Label htmlFor="preview_url">Preview URL</Label>
                <Input
                  id="preview_url"
                  value={newImage.preview_url}
                  onChange={(e) => setNewImage({ ...newImage, preview_url: e.target.value })}
                  placeholder="https://example.com/preview.jpg"
                />
              </div>

              <div>
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  value={newImage.dimensions}
                  onChange={(e) => setNewImage({ ...newImage, dimensions: e.target.value })}
                  placeholder="4096x2048"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newImage.description}
                  onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : editingImage ? "Update Photo" : "Add Photo"}
                </Button>
                {editingImage && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingImage(null)
                      setNewImage({
                        title: "",
                        description: "",
                        category_id: "",
                        price: "",
                        image_url: "",
                        preview_url: "",
                        file_size: "",
                        dimensions: "",
                        is_active: true,
                        is_featured: false,
                      })
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Photos ({images.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.id} className="border rounded-lg p-4 space-y-2">
                  {image.preview_url && (
                    <img
                      src={image.preview_url || "/placeholder.svg"}
                      alt={image.title}
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                  <h3 className="font-semibold">{image.title}</h3>
                  <p className="text-sm text-gray-600">{image.description}</p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant={image.is_active ? "default" : "secondary"}>
                      {image.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {image.is_featured && <Badge variant="outline">Featured</Badge>}
                    <Badge variant="outline">${image.price}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEdit(image)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toggleStatus(image, "is_active")}>
                      {image.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(image.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
