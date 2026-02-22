"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { 
  Images, 
  FileText, 
  Settings, 
  LogOut,
  Search,
  Download,
  Trash2,
  Edit,
  Eye,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImageType {
  id: string
  title: string
  description: string | null
  file_path: string
  original_url: string | null
  thumbnail_medium_url: string | null
  image_format: string
  content_category: string
  active: boolean
  price: number | null
}

export default function SimpleAdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("images")
  const [images, setImages] = useState<ImageType[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/featured-images?all=true")
      const data = await response.json()
      setImages(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load images",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteImage = async (imageId: string) => {
    try {
      setIsDeleting(imageId)
      const response = await fetch(`/api/admin/images/${imageId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setImages(images.filter(img => img.id !== imageId))
        toast({
          title: "Success",
          description: "Image deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete image",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const filteredImages = images.filter(img =>
    img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    img.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const equirectangularImages = filteredImages.filter(img => img.image_format === "equirectangular")
  const standardImages = filteredImages.filter(img => img.image_format !== "equirectangular")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-950 shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
              <p className="text-slate-400 mt-1">Manage your content and images</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/simple-admin/contracts")}
                className="text-slate-200 border-slate-600 hover:bg-slate-800"
              >
                <FileText className="h-4 w-4 mr-2" />
                Contracts
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  localStorage.removeItem("admin-session")
                  router.push("/")
                }}
                className="text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800 border-b border-slate-700 w-full h-auto p-0 rounded-none gap-0">
            <TabsTrigger 
              value="images"
              className="rounded-none border-b-2 border-b-transparent text-slate-300 hover:text-white data-[state=active]:border-b-cyan-500 data-[state=active]:text-white data-[state=active]:bg-slate-700/50"
            >
              <Images className="h-4 w-4 mr-2" />
              Images Management
            </TabsTrigger>
            <TabsTrigger 
              value="theatre"
              className="rounded-none border-b-2 border-b-transparent text-slate-300 hover:text-white data-[state=active]:border-b-cyan-500 data-[state=active]:text-white data-[state=active]:bg-slate-700/50"
            >
              <Eye className="h-4 w-4 mr-2" />
              Theatre Panoramas
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="rounded-none border-b-2 border-b-transparent text-slate-300 hover:text-white data-[state=active]:border-b-cyan-500 data-[state=active]:text-white data-[state=active]:bg-slate-700/50"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-6">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Image Gallery</h2>
                  <p className="text-slate-400 text-sm mt-1">
                    {filteredImages.length} image{filteredImages.length !== 1 ? "s" : ""} available
                  </p>
                </div>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Search images..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                </div>
              ) : filteredImages.length === 0 ? (
                <div className="text-center py-12">
                  <Images className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">No images found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Standard Images */}
                  {standardImages.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Badge className="bg-blue-600 text-white">Standard Images</Badge>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {standardImages.map((image) => (
                          <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-slate-700 border-slate-600">
                            <div className="relative h-48 bg-slate-600 overflow-hidden">
                              {image.thumbnail_medium_url && (
                                <Image
                                  src={image.thumbnail_medium_url}
                                  alt={image.title}
                                  fill
                                  className="object-cover"
                                />
                              )}
                              <div className="absolute top-2 right-2 flex gap-2">
                                {!image.active && (
                                  <Badge variant="outline" className="bg-red-900 text-red-300 border-red-700">
                                    Inactive
                                  </Badge>
                                )}
                                {image.active && (
                                  <Badge className="bg-green-600 text-white">
                                    Active
                                  </Badge>
                                )}
                                {image.content_category && (
                                  <Badge className="bg-cyan-600 text-white capitalize text-xs">
                                    {image.content_category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <CardContent className="p-4 bg-slate-700">
                              <h4 className="font-semibold text-white truncate">{image.title}</h4>
                              <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                                {image.description || "No description"}
                              </p>
                              <div className="mt-4 flex gap-2">
                                {image.original_url && (
                                  <a
                                    href={image.original_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1"
                                  >
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full text-xs text-slate-300 border-slate-500 hover:bg-slate-600"
                                    >
                                      <Download className="h-3 w-3 mr-1" />
                                      Download
                                    </Button>
                                  </a>
                                )}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="flex-1 text-xs"
                                  disabled={isDeleting === image.id}
                                  onClick={() => deleteImage(image.id)}
                                >
                                  {isDeleting === image.id ? (
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3 w-3 mr-1" />
                                  )}
                                  Delete
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Equirectangular Images */}
                  {equirectangularImages.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Badge className="bg-purple-600 text-white">360° Panoramas</Badge>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {equirectangularImages.map((image) => (
                          <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-slate-700 border-slate-600">
                            <div className="relative h-48 bg-slate-600 overflow-hidden">
                              {image.thumbnail_medium_url && (
                                <Image
                                  src={image.thumbnail_medium_url}
                                  alt={image.title}
                                  fill
                                  className="object-cover"
                                />
                              )}
                              <div className="absolute top-2 right-2 flex gap-2">
                                <Badge className="bg-purple-600 text-white text-xs">360°</Badge>
                                {!image.active && (
                                  <Badge variant="outline" className="bg-red-900 text-red-300 border-red-700">
                                    Inactive
                                  </Badge>
                                )}
                                {image.active && (
                                  <Badge className="bg-green-600 text-white">
                                    Active
                                  </Badge>
                                )}
                                {image.content_category && (
                                  <Badge className="bg-cyan-600 text-white capitalize text-xs">
                                    {image.content_category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <CardContent className="p-4 bg-slate-700">
                              <h4 className="font-semibold text-white truncate">{image.title}</h4>
                              <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                                {image.description || "No description"}
                              </p>
                              <div className="mt-4 flex gap-2">
                                {image.original_url && (
                                  <a
                                    href={image.original_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1"
                                  >
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full text-xs text-slate-300 border-slate-500 hover:bg-slate-600"
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      View
                                    </Button>
                                  </a>
                                )}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="flex-1 text-xs"
                                  disabled={isDeleting === image.id}
                                  onClick={() => deleteImage(image.id)}
                                >
                                  {isDeleting === image.id ? (
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3 w-3 mr-1" />
                                  )}
                                  Delete
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Theatre Tab */}
          <TabsContent value="theatre" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Theatre Panoramas (360° Images)</CardTitle>
                <CardDescription className="text-slate-400">
                  View and manage all equirectangular panoramic images used in Theatre mode
                </CardDescription>
              </CardHeader>
              <CardContent>
                {equirectangularImages.length === 0 ? (
                  <div className="text-center py-12">
                    <Eye className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">No panoramic images found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {equirectangularImages.map((image) => (
                      <Card key={image.id} className="overflow-hidden bg-slate-700 border-slate-600">
                        <div className="relative h-40 bg-slate-600">
                          {image.thumbnail_medium_url && (
                            <Image
                              src={image.thumbnail_medium_url}
                              alt={image.title}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <CardContent className="p-4 bg-slate-700">
                          <h4 className="font-semibold text-white">{image.title}</h4>
                          <p className="text-sm text-slate-300 mt-1">{image.description}</p>
                          {image.original_url && (
                            <div className="mt-3 p-2 bg-slate-800 rounded border border-slate-600">
                              <p className="text-xs text-slate-400 font-medium mb-1">Backblaze URL:</p>
                              <code className="text-xs text-cyan-400 break-all">
                                {image.original_url}
                              </code>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Admin Settings</CardTitle>
                <CardDescription className="text-slate-400">Manage admin preferences and configurations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-cyan-900/30 border border-cyan-700/50 rounded-lg">
                  <h4 className="font-semibold text-cyan-300 mb-2">Video Management</h4>
                  <p className="text-sm text-cyan-200">
                    Videos are now managed directly via Backblaze URLs in the database. 
                    Update video URLs in the images table with the <code className="bg-slate-900 px-2 py-1 rounded text-cyan-400">original_url</code> field.
                  </p>
                </div>

                <div className="p-4 bg-slate-700 border border-slate-600 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Image Statistics</h4>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-sm text-slate-300">Total Images</p>
                      <p className="text-2xl font-bold text-white">{images.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-300">360° Panoramas</p>
                      <p className="text-2xl font-bold text-purple-400">{equirectangularImages.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-300">Standard Images</p>
                      <p className="text-2xl font-bold text-blue-400">{standardImages.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-300">Active Images</p>
                      <p className="text-2xl font-bold text-green-400">
                        {images.filter(img => img.active).length}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
