"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Edit, Plus, Package } from "lucide-react"
import { toast } from "sonner"

interface CategoryStats {
  category: string
  count: number
  total_value: number
}

export function AdminCollectionManager() {
  const [categories, setCategories] = useState<CategoryStats[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const supabase = createClient()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      // Get category statistics
      const { data, error } = await supabase.from("images").select("category, price")

      if (error) throw error

      // Group by category and calculate stats
      const categoryMap = new Map<string, { count: number; total_value: number }>()

      data?.forEach((image) => {
        const category = image.category || "Uncategorized"
        const existing = categoryMap.get(category) || { count: 0, total_value: 0 }
        categoryMap.set(category, {
          count: existing.count + 1,
          total_value: existing.total_value + (image.price || 0),
        })
      })

      const categoryStats = Array.from(categoryMap.entries()).map(([category, stats]) => ({
        category,
        count: stats.count,
        total_value: stats.total_value,
      }))

      setCategories(categoryStats)
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Failed to fetch categories")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newCategory.trim()) {
      toast.error("Category name is required")
      return
    }

    try {
      // Create a placeholder image for the new category
      const { error } = await supabase.from("images").insert([
        {
          title: `${newCategory} Collection`,
          description: `Images in the ${newCategory} category`,
          category: newCategory.toLowerCase(),
          price: 0,
          active: false,
          featured: false,
        },
      ])

      if (error) throw error

      toast.success("Category created successfully")
      setIsDialogOpen(false)
      setNewCategory("")
      fetchCategories()
    } catch (error) {
      console.error("Error creating category:", error)
      toast.error("Failed to create category")
    }
  }

  const handleDeleteCategory = async (category: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the "${category}" category? This will affect ${categories.find((c) => c.category === category)?.count || 0} images.`,
      )
    ) {
      return
    }

    try {
      // Update all images in this category to 'uncategorized'
      const { error } = await supabase.from("images").update({ category: "uncategorized" }).eq("category", category)

      if (error) throw error

      toast.success("Category deleted successfully")
      fetchCategories()
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error("Failed to delete category")
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading collections...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Collection Management</h1>
          <p className="text-muted-foreground">Manage image categories and collections</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>Create a new category for organizing your images</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <Label htmlFor="category">Category Name</Label>
                <Input
                  id="category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g., Nature, Architecture, Abstract"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Category</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {categories.map((category) => (
          <Card key={category.category}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Package className="h-8 w-8 text-primary" />
                <Badge variant="secondary">{category.count} images</Badge>
              </div>
              <CardTitle className="capitalize">{category.category}</CardTitle>
              <CardDescription>Total value: ${category.total_value.toFixed(2)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = `/admin/images?category=${category.category}`)}
                >
                  View Images
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDeleteCategory(category.category)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Overview</CardTitle>
          <CardDescription>Summary of all image categories</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Average Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.category}>
                  <TableCell className="font-medium capitalize">{category.category}</TableCell>
                  <TableCell>{category.count}</TableCell>
                  <TableCell>${category.total_value.toFixed(2)}</TableCell>
                  <TableCell>
                    ${category.count > 0 ? (category.total_value / category.count).toFixed(2) : "0.00"}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => (window.location.href = `/admin/images?category=${category.category}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteCategory(category.category)}>
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
