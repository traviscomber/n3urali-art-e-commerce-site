"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Upload, Edit, Trash2, Eye, MoreHorizontal, Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const images = [
  {
    id: 1,
    title: "Urban Skyline 360°",
    category: "equirectangular",
    price: 49.99,
    sales: 23,
    status: "active",
    featured: true,
    uploadDate: "2024-01-10",
    thumbnail: "/urban-skyline-thumbnail.png",
  },
  {
    id: 2,
    title: "Forest Canopy Fisheye",
    category: "fisheye",
    price: 39.99,
    sales: 18,
    status: "active",
    featured: true,
    uploadDate: "2024-01-08",
    thumbnail: "/forest-canopy-thumbnail.png",
  },
  {
    id: 3,
    title: "Ocean Horizon 360°",
    category: "equirectangular",
    price: 54.99,
    sales: 15,
    status: "active",
    featured: false,
    uploadDate: "2024-01-05",
    thumbnail: "/placeholder.svg?height=80&width=80",
  },
]

export function AdminImageManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredImages = images.filter((image) => {
    const matchesSearch = image.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || image.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Image Management</h1>
          <p className="text-muted-foreground">Manage your image catalog and uploads</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Upload Images
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="all">All Categories</option>
              <option value="equirectangular">Equirectangular</option>
              <option value="fisheye">Fisheye</option>
            </select>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Images Grid */}
      <div className="grid gap-6">
        {filteredImages.map((image) => (
          <Card key={image.id} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={image.thumbnail || "/placeholder.svg"}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Image Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-card-foreground">{image.title}</h3>
                    {image.featured && <Badge className="bg-accent text-accent-foreground">Featured</Badge>}
                    <Badge variant="outline" className="capitalize">
                      {image.category}
                    </Badge>
                    <Badge variant={image.status === "active" ? "default" : "secondary"} className="capitalize">
                      {image.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span>Price: ${image.price}</span>
                    <span>Sales: {image.sales}</span>
                    <span>Uploaded: {image.uploadDate}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Upload className="h-4 w-4 mr-2" />
                        Replace File
                      </DropdownMenuItem>
                      <DropdownMenuItem>Toggle Featured</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Area */}
      <Card className="bg-card border-border border-dashed">
        <CardContent className="p-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">Upload New Images</h3>
              <p className="text-muted-foreground">
                Drag and drop your equirectangular or fisheye images here, or click to browse
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
