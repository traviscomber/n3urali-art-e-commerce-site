"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Trash2, Edit, Plus, Eye, Upload, X } from "lucide-react"
import { toast } from "sonner"

interface Image {
  id: number
  title: string
  description: string
  category: string
  price: number
  file_url: string
  preview_url: string
  thumbnail_url: string
  dimensions: string
  file_size: number
  tags: string[]
  featured: boolean
  active: boolean
  created_at: string
  updated_at: string
}

export function AdminImageManager() {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [editingImage, setEditingImage] = useState<Image | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState<{
    main: File | null
    preview: File | null
    thumbnail: File | null
  }>({
    main: null,
    preview: null,
    thumbnail: null,
  })
  const supabase = createClient()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: 0,
    tags: "",
    featured: false,
    active: true,
    file_url: "",
    preview_url: "",
    thumbnail_url: "",
    dimensions: "",
    file_size: 0,
  })

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase.from("images").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setImages(data || [])
    } catch (error) {
      console.error("Error fetching images:", error)
      toast.error("Failed to fetch images")
    } finally {
      setLoading(false)
    }
  }

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${path}/${fileName}`

    const { error: uploadError } = await supabase.storage.from("images").upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(filePath)

    return publicUrl
  }

  const handleFileSelect = (type: "main" | "preview" | "thumbnail", file: File | null) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [type]: file,
    }))

    if (type === "main" && file) {
      setFormData((prev) => ({
        ...prev,
        file_size: file.size,
      }))

      const img = new Image()
      img.onload = () => {
        setFormData((prev) => ({
          ...prev,
          dimensions: `${img.width}x${img.height}`,
        }))
      }
      img.src = URL.createObjectURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setUploading(true)
      setUploadProgress(0)

      const imageData = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        updated_at: new Date().toISOString(),
      }

      if (selectedFiles.main) {
        setUploadProgress(20)
        imageData.file_url = await uploadFile(selectedFiles.main, "main")
      }

      if (selectedFiles.preview) {
        setUploadProgress(50)
        imageData.preview_url = await uploadFile(selectedFiles.preview, "previews")
      }

      if (selectedFiles.thumbnail) {
        setUploadProgress(80)
        imageData.thumbnail_url = await uploadFile(selectedFiles.thumbnail, "thumbnails")
      }

      setUploadProgress(90)

      if (editingImage) {
        const { error } = await supabase.from("images").update(imageData).eq("id", editingImage.id)

        if (error) throw error
        toast.success("Image updated successfully")
      } else {
        const { error } = await supabase.from("images").insert([imageData])

        if (error) throw error
        toast.success("Image created successfully")
      }

      setUploadProgress(100)
      setIsDialogOpen(false)
      setEditingImage(null)
      resetForm()
      fetchImages()
    } catch (error) {
      console.error("Error saving image:", error)
      toast.error("Failed to save image")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleEdit = (image: Image) => {
    setEditingImage(image)
    setFormData({
      title: image.title || "",
      description: image.description || "",
      category: image.category || "",
      price: image.price || 0,
      tags: image.tags?.join(", ") || "",
      featured: image.featured || false,
      active: image.active !== false,
      file_url: image.file_url || "",
      preview_url: image.preview_url || "",
      thumbnail_url: image.thumbnail_url || "",
      dimensions: image.dimensions || "",
      file_size: image.file_size || 0,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    try {
      const { error } = await supabase.from("images").delete().eq("id", id)

      if (error) throw error
      toast.success("Image deleted successfully")
      fetchImages()
    } catch (error) {
      console.error("Error deleting image:", error)
      toast.error("Failed to delete image")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      price: 0,
      tags: "",
      featured: false,
      active: true,
      file_url: "",
      preview_url: "",
      thumbnail_url: "",
      dimensions: "",
      file_size: 0,
    })
    setSelectedFiles({
      main: null,
      preview: null,
      thumbnail: null,
    })
  }

  const handleNewImage = () => {
    setEditingImage(null)
    resetForm()
    setIsDialogOpen(true)
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading images...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Image Management</h1>
          <p className="text-muted-foreground">Upload and manage your 360° and fisheye images</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewImage}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingImage ? "Edit Image" : "Upload New Image"}</DialogTitle>
              <DialogDescription>
                {editingImage ? "Update image details and files" : "Upload a new 360° or fisheye image"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">File Uploads</h3>

                <div className="space-y-2">
                  <Label htmlFor="main-file">Main Image File *</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="main-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect("main", e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    {selectedFiles.main && (
                      <Button type="button" variant="outline" size="sm" onClick={() => handleFileSelect("main", null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {selectedFiles.main && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFiles.main.name} ({(selectedFiles.main.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preview-file">Preview Image (Optional)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="preview-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect("preview", e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    {selectedFiles.preview && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleFileSelect("preview", null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail-file">Thumbnail (Optional)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="thumbnail-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect("thumbnail", e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    {selectedFiles.thumbnail && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleFileSelect("thumbnail", null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <Label>Upload Progress</Label>
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground">Uploading files... {uploadProgress}%</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equirectangular">Equirectangular</SelectItem>
                      <SelectItem value="fisheye">Fisheye</SelectItem>
                      <SelectItem value="panorama">Panorama</SelectItem>
                      <SelectItem value="360">360°</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="nature, landscape, 360"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    placeholder="e.g., 4096x2048"
                  />
                </div>
                <div>
                  <Label htmlFor="file_size">File Size (bytes)</Label>
                  <Input
                    id="file_size"
                    type="number"
                    value={formData.file_size}
                    onChange={(e) => setFormData({ ...formData, file_size: Number.parseInt(e.target.value) || 0 })}
                    readOnly
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={uploading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>{editingImage ? "Update" : "Upload"} Image</>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Images ({images.length})</CardTitle>
          <CardDescription>All images in your collection</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {images.map((image) => (
                <TableRow key={image.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {image.thumbnail_url && (
                        <img
                          src={image.thumbnail_url || "/placeholder.svg"}
                          alt={image.title}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium">{image.title}</div>
                        <div className="text-sm text-muted-foreground">{image.dimensions}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{image.category}</Badge>
                  </TableCell>
                  <TableCell>${image.price}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {image.featured && <Badge variant="default">Featured</Badge>}
                      <Badge variant={image.active ? "default" : "secondary"}>
                        {image.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(image.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {image.preview_url && (
                        <Button variant="outline" size="sm" onClick={() => window.open(image.preview_url, "_blank")}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleEdit(image)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(image.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
