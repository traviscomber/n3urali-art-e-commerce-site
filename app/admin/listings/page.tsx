"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Search,
  TrendingUp,
  TrendingDown,
  Star,
  Eye,
  EyeOff,
  DollarSign,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ListingData {
  id: number
  title: string
  category: "equirectangular" | "fisheye"
  price: number
  active: boolean
  featured: boolean
  created_at: string
  thumbnail_url: string
  tags: string[]
  // Analytics data (would come from orders/downloads tables)
  sales_count?: number
  revenue?: number
  views?: number
  conversion_rate?: number
}

interface BulkAction {
  type: "activate" | "deactivate" | "feature" | "unfeature" | "price_update" | "delete"
  label: string
  icon: React.ReactNode
  variant?: "default" | "destructive"
}

const bulkActions: BulkAction[] = [
  { type: "activate", label: "Activate Selected", icon: <Eye className="h-4 w-4" /> },
  { type: "deactivate", label: "Deactivate Selected", icon: <EyeOff className="h-4 w-4" /> },
  { type: "feature", label: "Add to Featured", icon: <Star className="h-4 w-4" /> },
  { type: "unfeature", label: "Remove from Featured", icon: <Star className="h-4 w-4" /> },
  { type: "delete", label: "Delete Selected", icon: <Package className="h-4 w-4" />, variant: "destructive" },
]

export default function AdminListingsPage() {
  const [listings, setListings] = useState<ListingData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedListings, setSelectedListings] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [bulkPriceUpdate, setBulkPriceUpdate] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const supabase = createBrowserClient()

  useEffect(() => {
    loadListings()
  }, [])

  const loadListings = async () => {
    if (!supabase) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("images")
        .select("*")
        .order(sortBy, { ascending: sortOrder === "asc" })

      if (error) throw error

      // In a real app, you'd join with orders/analytics tables for sales data
      const listingsWithAnalytics = (data || []).map((item) => ({
        ...item,
        sales_count: Math.floor(Math.random() * 50), // Mock data
        revenue: Math.floor(Math.random() * 1000),
        views: Math.floor(Math.random() * 500),
        conversion_rate: Math.random() * 10,
      }))

      setListings(listingsWithAnalytics)
    } catch (err) {
      console.error("Error loading listings:", err)
      setError(err instanceof Error ? err.message : "Failed to load listings")
    } finally {
      setLoading(false)
    }
  }

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = categoryFilter === "all" || listing.category === categoryFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && listing.active) ||
      (statusFilter === "inactive" && !listing.active) ||
      (statusFilter === "featured" && listing.featured)

    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedListings(new Set(filteredListings.map((l) => l.id)))
    } else {
      setSelectedListings(new Set())
    }
  }

  const handleSelectListing = (listingId: number, checked: boolean) => {
    const newSelected = new Set(selectedListings)
    if (checked) {
      newSelected.add(listingId)
    } else {
      newSelected.delete(listingId)
    }
    setSelectedListings(newSelected)
  }

  const handleBulkAction = async (action: BulkAction["type"]) => {
    if (!supabase || selectedListings.size === 0) return

    try {
      setIsUpdating(true)
      const selectedIds = Array.from(selectedListings)

      let updates: any = {}
      let successMessage = ""

      switch (action) {
        case "activate":
          updates = { active: true }
          successMessage = `Activated ${selectedIds.length} listings`
          break
        case "deactivate":
          updates = { active: false }
          successMessage = `Deactivated ${selectedIds.length} listings`
          break
        case "feature":
          updates = { featured: true }
          successMessage = `Added ${selectedIds.length} listings to featured`
          break
        case "unfeature":
          updates = { featured: false }
          successMessage = `Removed ${selectedIds.length} listings from featured`
          break
        case "price_update":
          if (!bulkPriceUpdate || isNaN(Number.parseFloat(bulkPriceUpdate))) {
            setError("Please enter a valid price")
            return
          }
          updates = { price: Number.parseFloat(bulkPriceUpdate) }
          successMessage = `Updated price for ${selectedIds.length} listings`
          break
        case "delete":
          const { error: deleteError } = await supabase.from("images").delete().in("id", selectedIds)

          if (deleteError) throw deleteError

          setListings((prev) => prev.filter((l) => !selectedIds.includes(l.id)))
          setSelectedListings(new Set())
          setSuccess(`Deleted ${selectedIds.length} listings`)
          return
      }

      const { error } = await supabase.from("images").update(updates).in("id", selectedIds)

      if (error) throw error

      // Update local state
      setListings((prev) =>
        prev.map((listing) => (selectedIds.includes(listing.id) ? { ...listing, ...updates } : listing)),
      )

      setSelectedListings(new Set())
      setBulkPriceUpdate("")
      setSuccess(successMessage)
    } catch (err) {
      console.error("Bulk action error:", err)
      setError(err instanceof Error ? err.message : "Bulk action failed")
    } finally {
      setIsUpdating(false)
    }
  }

  const getPerformanceIndicator = (listing: ListingData) => {
    const conversionRate = listing.conversion_rate || 0
    if (conversionRate > 5) return { icon: <TrendingUp className="h-4 w-4 text-green-500" />, label: "High" }
    if (conversionRate > 2) return { icon: <TrendingUp className="h-4 w-4 text-yellow-500" />, label: "Medium" }
    return { icon: <TrendingDown className="h-4 w-4 text-red-500" />, label: "Low" }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading listings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Listing Management</h1>
          <p className="text-muted-foreground">Manage your product catalog and performance</p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="border-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-destructive">
            {error}
            <Button
              variant="link"
              className="p-0 h-auto ml-2 text-destructive underline"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">
            {success}
            <Button
              variant="link"
              className="p-0 h-auto ml-2 text-green-700 underline"
              onClick={() => setSuccess(null)}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{listings.length}</div>
            <p className="text-xs text-muted-foreground">{listings.filter((l) => l.active).length} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured Items</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{listings.filter((l) => l.featured).length}</div>
            <p className="text-xs text-muted-foreground">
              {((listings.filter((l) => l.featured).length / listings.length) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {listings.length > 0
                ? (listings.reduce((sum, l) => sum + l.price, 0) / listings.length).toFixed(2)
                : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Range: ${Math.min(...listings.map((l) => l.price)).toFixed(2)} - $
              {Math.max(...listings.map((l) => l.price)).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${listings.reduce((sum, l) => sum + (l.revenue || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From {listings.reduce((sum, l) => sum + (l.sales_count || 0), 0)} sales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Bulk Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="equirectangular">360° Images</SelectItem>
                  <SelectItem value="fisheye">Fisheye</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {selectedListings.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{selectedListings.size} selected</span>

                <div className="flex items-center gap-2">
                  <Input
                    placeholder="New price"
                    value={bulkPriceUpdate}
                    onChange={(e) => setBulkPriceUpdate(e.target.value)}
                    className="w-24"
                    type="number"
                    step="0.01"
                  />
                  <Button size="sm" onClick={() => handleBulkAction("price_update")} disabled={isUpdating}>
                    Update Price
                  </Button>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" disabled={isUpdating}>
                      {isUpdating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Bulk Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {bulkActions.map((action) => (
                      <DropdownMenuItem
                        key={action.type}
                        onClick={() => handleBulkAction(action.type)}
                        className={action.variant === "destructive" ? "text-destructive" : ""}
                      >
                        {action.icon}
                        <span className="ml-2">{action.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Listings Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Listings</CardTitle>
              <CardDescription>
                {filteredListings.length} of {listings.length} listings
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedListings.size === filteredListings.length && filteredListings.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">Select All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-2">
            {filteredListings.map((listing) => {
              const performance = getPerformanceIndicator(listing)
              return (
                <div key={listing.id} className="flex items-center gap-4 p-4 border-b border-border last:border-b-0">
                  <Checkbox
                    checked={selectedListings.has(listing.id)}
                    onCheckedChange={(checked) => handleSelectListing(listing.id, !!checked)}
                  />

                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={listing.thumbnail_url || "/placeholder.svg"}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{listing.title}</h3>
                      {listing.featured && <Badge variant="secondary">Featured</Badge>}
                      <Badge variant={listing.active ? "default" : "secondary"}>
                        {listing.active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {listing.category === "equirectangular" ? "360°" : "Fisheye"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>${listing.price}</span>
                      <span>{listing.sales_count || 0} sales</span>
                      <span>${listing.revenue || 0} revenue</span>
                      <div className="flex items-center gap-1">
                        {performance.icon}
                        <span>{performance.label} performance</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium">{listing.views || 0} views</div>
                    <div className="text-xs text-muted-foreground">
                      {(listing.conversion_rate || 0).toFixed(1)}% conversion
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No listings found</h3>
              <p className="text-muted-foreground">
                {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                  ? "No listings match your current filters."
                  : "Start by uploading your first image."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
