"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, ShoppingCart, TrendingUp, Eye, Download, Upload } from "lucide-react"

const stats = [
  {
    title: "Total Revenue",
    value: "$12,847",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: DollarSign,
    description: "From 89 orders this month",
  },
  {
    title: "Orders",
    value: "89",
    change: "+8.2%",
    changeType: "positive" as const,
    icon: ShoppingCart,
    description: "23 pending, 66 completed",
  },
  {
    title: "Active Images",
    value: "247",
    change: "+15.3%",
    changeType: "positive" as const,
    icon: Eye,
    description: "12 uploaded this week",
  },
  {
    title: "Downloads",
    value: "1,429",
    change: "+22.1%",
    changeType: "positive" as const,
    icon: Download,
    description: "Total downloads this month",
  },
]

const recentOrders = [
  {
    id: "ORD-001",
    customer: "john@example.com",
    image: "Urban Skyline 360°",
    license: "Extended",
    amount: "$124.97",
    status: "completed",
    date: "2024-01-15",
  },
  {
    id: "ORD-002",
    customer: "sarah@studio.com",
    image: "Forest Canopy Fisheye",
    license: "Commercial",
    amount: "$199.95",
    status: "pending",
    date: "2024-01-15",
  },
  {
    id: "ORD-003",
    customer: "mike@agency.co",
    image: "Ocean Horizon 360°",
    license: "Standard",
    amount: "$54.99",
    status: "completed",
    date: "2024-01-14",
  },
]

const topImages = [
  {
    title: "Urban Skyline 360°",
    sales: 23,
    revenue: "$1,149.77",
    category: "equirectangular",
  },
  {
    title: "Forest Canopy Fisheye",
    sales: 18,
    revenue: "$719.82",
    category: "fisheye",
  },
  {
    title: "Mountain Peak 360°",
    sales: 15,
    revenue: "$899.85",
    category: "equirectangular",
  },
]

export function AdminDashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Badge variant={stat.changeType === "positive" ? "default" : "destructive"} className="text-xs">
                  {stat.change}
                </Badge>
                <span>{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Recent Orders</CardTitle>
            <CardDescription>Latest customer purchases and downloads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-card-foreground">{order.customer}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.image} • {order.license}
                    </p>
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium text-card-foreground">{order.amount}</p>
                    <Badge variant={order.status === "completed" ? "default" : "secondary"} className="text-xs">
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 bg-transparent">
              View All Orders
            </Button>
          </CardContent>
        </Card>

        {/* Top Performing Images */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Top Performing Images</CardTitle>
            <CardDescription>Best selling images this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topImages.map((image, index) => (
                <div key={image.title} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-card-foreground">{image.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {image.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium text-card-foreground">{image.revenue}</p>
                    <p className="text-xs text-muted-foreground">{image.sales} sales</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 bg-transparent">
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button className="h-20 flex-col space-y-2">
              <Upload className="h-5 w-5" />
              <span>Upload Images</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <ShoppingCart className="h-5 w-5" />
              <span>Process Orders</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <TrendingUp className="h-5 w-5" />
              <span>View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
