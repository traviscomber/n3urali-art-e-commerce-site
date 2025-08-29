"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Download, Search, Filter, TrendingDown } from "lucide-react"

export const dynamic = "force-dynamic"

interface DownloadLog {
  id: string
  order_item_id: string
  user_email: string
  ip_address: string
  downloaded_at: string
  image_title: string
  license_type: string
}

export default function AdminDownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [stats, setStats] = useState({
    totalDownloads: 0,
    todayDownloads: 0,
    uniqueUsers: 0,
  })

  useEffect(() => {
    fetchDownloads()
    fetchStats()
  }, [])

  const fetchDownloads = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("download_logs")
        .select(`
          *,
          order_items!inner(
            license_type,
            images!inner(title)
          )
        `)
        .order("downloaded_at", { ascending: false })
        .limit(100)

      if (error) throw error

      const formattedData =
        data?.map((log) => ({
          ...log,
          image_title: log.order_items.images.title,
          license_type: log.order_items.license_type,
        })) || []

      setDownloads(formattedData)
    } catch (error) {
      console.error("Error fetching downloads:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const supabase = createClient()

      // Get total downloads
      const { count: totalCount } = await supabase.from("download_logs").select("*", { count: "exact", head: true })

      // Get today's downloads
      const today = new Date().toISOString().split("T")[0]
      const { count: todayCount } = await supabase
        .from("download_logs")
        .select("*", { count: "exact", head: true })
        .gte("downloaded_at", today)

      // Get unique users
      const { data: uniqueUsersData } = await supabase
        .from("download_logs")
        .select("user_email")
        .not("user_email", "is", null)

      const uniqueUsers = new Set(uniqueUsersData?.map((u) => u.user_email)).size

      setStats({
        totalDownloads: totalCount || 0,
        todayDownloads: todayCount || 0,
        uniqueUsers,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const filteredDownloads = downloads.filter(
    (download) =>
      download.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      download.image_title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Download Management</h1>
        <p className="text-muted-foreground">Monitor and manage user downloads</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDownloads.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Downloads</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayDownloads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search downloads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Downloads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Downloads</CardTitle>
          <CardDescription>Latest download activity across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDownloads.map((download) => (
              <div key={download.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{download.image_title}</div>
                  <div className="text-sm text-muted-foreground">
                    {download.user_email} • {download.ip_address}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(download.downloaded_at).toLocaleString()}
                  </div>
                </div>
                <Badge variant="outline">{download.license_type}</Badge>
              </div>
            ))}
            {filteredDownloads.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No downloads found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
