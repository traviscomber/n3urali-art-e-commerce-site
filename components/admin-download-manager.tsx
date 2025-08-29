"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, Download, Calendar, User } from "lucide-react"
import { toast } from "sonner"

interface DownloadLog {
  id: number
  user_email: string
  download_token: string
  order_item_id: number
  ip_address: string
  user_agent: string
  downloaded_at: string
  created_at: string
  expires_at: string
}

export function AdminDownloadManager() {
  const [downloads, setDownloads] = useState<DownloadLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
  })
  const supabase = createClient()

  useEffect(() => {
    fetchDownloads()
    fetchStats()
  }, [])

  const fetchDownloads = async () => {
    try {
      const { data, error } = await supabase
        .from("download_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)

      if (error) throw error
      setDownloads(data || [])
    } catch (error) {
      console.error("Error fetching downloads:", error)
      toast.error("Failed to fetch downloads")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      const [totalResult, todayResult, weekResult, monthResult] = await Promise.all([
        supabase.from("download_logs").select("*", { count: "exact", head: true }),
        supabase
          .from("download_logs")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today.toISOString()),
        supabase
          .from("download_logs")
          .select("*", { count: "exact", head: true })
          .gte("created_at", weekAgo.toISOString()),
        supabase
          .from("download_logs")
          .select("*", { count: "exact", head: true })
          .gte("created_at", monthAgo.toISOString()),
      ])

      setStats({
        total: totalResult.count || 0,
        today: todayResult.count || 0,
        thisWeek: weekResult.count || 0,
        thisMonth: monthResult.count || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const filteredDownloads = downloads.filter(
    (download) =>
      download.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      download.ip_address?.includes(searchTerm) ||
      download.download_token?.includes(searchTerm),
  )

  if (loading) {
    return <div className="flex justify-center p-8">Loading downloads...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Download Management</h1>
        <p className="text-muted-foreground">Track and manage file downloads</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeek}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email, IP address, or token..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Downloads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Downloads ({filteredDownloads.length})</CardTitle>
          <CardDescription>Latest download activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Downloaded</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDownloads.map((download) => {
                const isExpired = new Date(download.expires_at) < new Date()
                const isDownloaded = !!download.downloaded_at

                return (
                  <TableRow key={download.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{download.user_email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {download.download_token?.substring(0, 8)}...
                      </code>
                    </TableCell>
                    <TableCell>{download.ip_address}</TableCell>
                    <TableCell>
                      {isDownloaded ? (
                        <div className="flex items-center space-x-2">
                          <Download className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{new Date(download.downloaded_at).toLocaleString()}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not downloaded</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{new Date(download.expires_at).toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isDownloaded ? "default" : isExpired ? "destructive" : "secondary"}>
                        {isDownloaded ? "Downloaded" : isExpired ? "Expired" : "Active"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
