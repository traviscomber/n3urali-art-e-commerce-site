import { createNeonClient } from "@/lib/neon/client"

export interface AnalyticsMetrics {
  totalDownloads: number
  totalRevenue: number
  totalUsers: number
  totalOrders: number
  averageOrderValue: number
  conversionRate: number
  topImages: Array<{
    id: string
    title: string
    downloads: number
    revenue: number
  }>
  topLicenses: Array<{
    name: string
    purchases: number
    revenue: number
  }>
  downloadsByPeriod: Array<{
    period: string
    downloads: number
    revenue: number
  }>
  userActivity: Array<{
    date: string
    newUsers: number
    returningUsers: number
    downloads: number
  }>
  geographicData: Array<{
    country: string
    downloads: number
    revenue: number
  }>
}

export interface DownloadAnalytics {
  imageId: string
  imageTitle: string
  totalDownloads: number
  uniqueUsers: number
  averageDownloadsPerUser: number
  peakDownloadHour: number
  mostPopularLicense: string
  revenueGenerated: number
  downloadsByDay: Array<{
    date: string
    downloads: number
  }>
  downloadsByLicense: Array<{
    licenseName: string
    downloads: number
    revenue: number
  }>
}

export interface UserAnalytics {
  userEmail: string
  totalPurchases: number
  totalSpent: number
  totalDownloads: number
  favoriteCategory: string
  preferredLicense: string
  lastActivity: string
  downloadPatterns: Array<{
    hour: number
    downloads: number
  }>
}

export class AnalyticsService {
  private static instance: AnalyticsService
  private sql = createNeonClient()

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  async getOverallMetrics(startDate?: string, endDate?: string): Promise<AnalyticsMetrics> {
    const dateFilter = this.buildDateFilter(startDate, endDate)

    try {
      // Get basic metrics
      const [
        downloadStats,
        revenueStats,
        userStats,
        orderStats,
        topImages,
        topLicenses,
        downloadsByPeriod,
        userActivity,
        geographicData,
      ] = await Promise.all([
        this.getDownloadStats(dateFilter),
        this.getRevenueStats(dateFilter),
        this.getUserStats(dateFilter),
        this.getOrderStats(dateFilter),
        this.getTopImages(dateFilter),
        this.getTopLicenses(dateFilter),
        this.getDownloadsByPeriod(dateFilter),
        this.getUserActivity(dateFilter),
        this.getGeographicData(dateFilter),
      ])

      const averageOrderValue = orderStats.totalOrders > 0 ? revenueStats.totalRevenue / orderStats.totalOrders : 0
      const conversionRate = userStats.totalUsers > 0 ? (orderStats.totalOrders / userStats.totalUsers) * 100 : 0

      return {
        totalDownloads: downloadStats.totalDownloads,
        totalRevenue: revenueStats.totalRevenue,
        totalUsers: userStats.totalUsers,
        totalOrders: orderStats.totalOrders,
        averageOrderValue,
        conversionRate,
        topImages,
        topLicenses,
        downloadsByPeriod,
        userActivity,
        geographicData,
      }
    } catch (error) {
      console.error("Analytics metrics error:", error)
      throw new Error("Failed to fetch analytics metrics")
    }
  }

  async getImageAnalytics(imageId: string, startDate?: string, endDate?: string): Promise<DownloadAnalytics> {
    const dateFilter = this.buildDateFilter(startDate, endDate, "dl.downloaded_at")

    try {
      const result = await this.sql`
        SELECT 
          i.id,
          i.title,
          COUNT(DISTINCT dl.id) as total_downloads,
          COUNT(DISTINCT o.user_email) as unique_users,
          ROUND(COUNT(DISTINCT dl.id)::numeric / NULLIF(COUNT(DISTINCT o.user_email), 0), 2) as avg_downloads_per_user,
          EXTRACT(HOUR FROM dl.downloaded_at) as peak_hour,
          SUM(oi.price) as revenue_generated
        FROM images i
        LEFT JOIN order_items oi ON i.id = oi.image_id
        LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'completed'
        LEFT JOIN download_logs dl ON oi.id = dl.order_item_id ${dateFilter ? this.sql`AND ${dateFilter}` : this.sql``}
        WHERE i.id = ${imageId}
        GROUP BY i.id, i.title, EXTRACT(HOUR FROM dl.downloaded_at)
        ORDER BY COUNT(dl.id) DESC
        LIMIT 1
      `

      if (!result[0]) {
        throw new Error("Image not found")
      }

      const imageData = result[0]

      // Get downloads by day
      const downloadsByDay = await this.sql`
        SELECT 
          DATE(dl.downloaded_at) as date,
          COUNT(*) as downloads
        FROM download_logs dl
        JOIN order_items oi ON dl.order_item_id = oi.id
        WHERE oi.image_id = ${imageId} ${dateFilter ? this.sql`AND ${dateFilter}` : this.sql``}
        GROUP BY DATE(dl.downloaded_at)
        ORDER BY date DESC
        LIMIT 30
      `

      // Get downloads by license
      const downloadsByLicense = await this.sql`
        SELECT 
          l.name as license_name,
          COUNT(dl.id) as downloads,
          SUM(oi.price) as revenue
        FROM download_logs dl
        JOIN order_items oi ON dl.order_item_id = oi.id
        JOIN licenses l ON oi.license_id = l.id
        WHERE oi.image_id = ${imageId} ${dateFilter ? this.sql`AND ${dateFilter}` : this.sql``}
        GROUP BY l.name
        ORDER BY downloads DESC
      `

      // Get most popular license
      const mostPopularLicense = downloadsByLicense[0]?.license_name || "Unknown"

      return {
        imageId,
        imageTitle: imageData.title,
        totalDownloads: Number.parseInt(imageData.total_downloads) || 0,
        uniqueUsers: Number.parseInt(imageData.unique_users) || 0,
        averageDownloadsPerUser: Number.parseFloat(imageData.avg_downloads_per_user) || 0,
        peakDownloadHour: Number.parseInt(imageData.peak_hour) || 0,
        mostPopularLicense,
        revenueGenerated: Number.parseFloat(imageData.revenue_generated) || 0,
        downloadsByDay: downloadsByDay.map((row) => ({
          date: row.date,
          downloads: Number.parseInt(row.downloads),
        })),
        downloadsByLicense: downloadsByLicense.map((row) => ({
          licenseName: row.license_name,
          downloads: Number.parseInt(row.downloads),
          revenue: Number.parseFloat(row.revenue),
        })),
      }
    } catch (error) {
      console.error("Image analytics error:", error)
      throw new Error("Failed to fetch image analytics")
    }
  }

  async getUserAnalytics(userEmail: string, startDate?: string, endDate?: string): Promise<UserAnalytics> {
    const dateFilter = this.buildDateFilter(startDate, endDate, "o.created_at")

    try {
      const userStats = await this.sql`
        SELECT 
          o.user_email,
          COUNT(DISTINCT o.id) as total_purchases,
          SUM(o.total_amount) as total_spent,
          COUNT(DISTINCT dl.id) as total_downloads,
          MAX(dl.downloaded_at) as last_activity
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN download_logs dl ON oi.id = dl.order_item_id
        WHERE o.user_email = ${userEmail} 
        AND o.status = 'completed'
        ${dateFilter ? this.sql`AND ${dateFilter}` : this.sql``}
        GROUP BY o.user_email
      `

      if (!userStats[0]) {
        throw new Error("User not found or no activity")
      }

      const userData = userStats[0]

      // Get favorite category
      const categoryStats = await this.sql`
        SELECT 
          c.name as category_name,
          COUNT(*) as purchases
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN images i ON oi.image_id = i.id
        JOIN categories c ON i.category_id = c.id
        WHERE o.user_email = ${userEmail} 
        AND o.status = 'completed'
        ${dateFilter ? this.sql`AND ${dateFilter}` : this.sql``}
        GROUP BY c.name
        ORDER BY purchases DESC
        LIMIT 1
      `

      // Get preferred license
      const licenseStats = await this.sql`
        SELECT 
          l.name as license_name,
          COUNT(*) as purchases
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN licenses l ON oi.license_id = l.id
        WHERE o.user_email = ${userEmail} 
        AND o.status = 'completed'
        ${dateFilter ? this.sql`AND ${dateFilter}` : this.sql``}
        GROUP BY l.name
        ORDER BY purchases DESC
        LIMIT 1
      `

      // Get download patterns by hour
      const downloadPatterns = await this.sql`
        SELECT 
          EXTRACT(HOUR FROM dl.downloaded_at) as hour,
          COUNT(*) as downloads
        FROM download_logs dl
        JOIN order_items oi ON dl.order_item_id = oi.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.user_email = ${userEmail}
        ${dateFilter ? this.sql`AND ${dateFilter}` : this.sql``}
        GROUP BY EXTRACT(HOUR FROM dl.downloaded_at)
        ORDER BY hour
      `

      return {
        userEmail,
        totalPurchases: Number.parseInt(userData.total_purchases) || 0,
        totalSpent: Number.parseFloat(userData.total_spent) || 0,
        totalDownloads: Number.parseInt(userData.total_downloads) || 0,
        favoriteCategory: categoryStats[0]?.category_name || "Unknown",
        preferredLicense: licenseStats[0]?.license_name || "Unknown",
        lastActivity: userData.last_activity || "Never",
        downloadPatterns: downloadPatterns.map((row) => ({
          hour: Number.parseInt(row.hour),
          downloads: Number.parseInt(row.downloads),
        })),
      }
    } catch (error) {
      console.error("User analytics error:", error)
      throw new Error("Failed to fetch user analytics")
    }
  }

  private async getDownloadStats(dateFilter: any) {
    const result = await this.sql`
      SELECT COUNT(*) as total_downloads
      FROM download_logs dl
      WHERE dl.success = true ${dateFilter ? this.sql`AND ${dateFilter}` : this.sql``}
    `
    return { totalDownloads: Number.parseInt(result[0]?.total_downloads) || 0 }
  }

  private async getRevenueStats(dateFilter: any) {
    const result = await this.sql`
      SELECT SUM(total_amount) as total_revenue
      FROM orders o
      WHERE o.status = 'completed' ${dateFilter ? this.sql`AND ${dateFilter}` : this.sql``}
    `
    return { totalRevenue: Number.parseFloat(result[0]?.total_revenue) || 0 }
  }

  private async getUserStats(dateFilter: any) {
    const result = await this.sql`
      SELECT COUNT(DISTINCT user_email) as total_users
      FROM orders o
      WHERE o.status = 'completed' ${dateFilter ? this.sql`AND ${dateFilter}` : this.sql``}
    `
    return { totalUsers: Number.parseInt(result[0]?.total_users) || 0 }
  }

  private async getOrderStats(dateFilter: any) {
    const result = await this.sql`
      SELECT COUNT(*) as total_orders
      FROM orders o
      WHERE o.status = 'completed' ${dateFilter ? this.sql`AND ${dateFilter}` : this.sql``}
    `
    return { totalOrders: Number.parseInt(result[0]?.total_orders) || 0 }
  }

  private async getTopImages(dateFilter: any) {
    const result = await this.sql`
      SELECT 
        i.id,
        i.title,
        COUNT(dl.id) as downloads,
        SUM(oi.price) as revenue
      FROM images i
      LEFT JOIN order_items oi ON i.id = oi.image_id
      LEFT JOIN download_logs dl ON oi.id = dl.order_item_id
      WHERE dl.success = true ${dateFilter ? this.sql`AND ${dateFilter}` : this.sql``}
      GROUP BY i.id, i.title
      ORDER BY downloads DESC
      LIMIT 10
    `
    return result.map((row) => ({
      id: row.id,
      title: row.title,
      downloads: Number.parseInt(row.downloads) || 0,
      revenue: Number.parseFloat(row.revenue) || 0,
    }))
  }

  private async getTopLicenses(dateFilter: any) {
    const result = await this.sql`
      SELECT 
        l.name,
        COUNT(oi.id) as purchases,
        SUM(oi.price) as revenue
      FROM licenses l
      LEFT JOIN order_items oi ON l.id = oi.license_id
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'completed' ${dateFilter ? this.sql`AND ${dateFilter}` : this.sql``}
      GROUP BY l.name
      ORDER BY purchases DESC
    `
    return result.map((row) => ({
      name: row.name,
      purchases: Number.parseInt(row.purchases) || 0,
      revenue: Number.parseFloat(row.revenue) || 0,
    }))
  }

  private async getDownloadsByPeriod(dateFilter: any) {
    const result = await this.sql`
      SELECT 
        DATE(dl.downloaded_at) as period,
        COUNT(*) as downloads,
        SUM(oi.price) as revenue
      FROM download_logs dl
      JOIN order_items oi ON dl.order_item_id = oi.id
      WHERE dl.success = true ${dateFilter ? this.sql`AND ${dateFilter}` : this.sql``}
      GROUP BY DATE(dl.downloaded_at)
      ORDER BY period DESC
      LIMIT 30
    `
    return result.map((row) => ({
      period: row.period,
      downloads: Number.parseInt(row.downloads) || 0,
      revenue: Number.parseFloat(row.revenue) || 0,
    }))
  }

  private async getUserActivity(dateFilter: any) {
    const result = await this.sql`
      SELECT 
        DATE(o.created_at) as date,
        COUNT(DISTINCT CASE WHEN o.created_at::date = o.created_at::date THEN o.user_email END) as new_users,
        COUNT(DISTINCT dl.id) as downloads
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN download_logs dl ON oi.id = dl.order_item_id
      WHERE o.status = 'completed' ${dateFilter ? this.sql`AND ${dateFilter}` : this.sql``}
      GROUP BY DATE(o.created_at)
      ORDER BY date DESC
      LIMIT 30
    `
    return result.map((row) => ({
      date: row.date,
      newUsers: Number.parseInt(row.new_users) || 0,
      returningUsers: 0, // Would need more complex logic to track returning users
      downloads: Number.parseInt(row.downloads) || 0,
    }))
  }

  private async getGeographicData(dateFilter: any) {
    // This would require IP geolocation data
    // For now, return mock data
    return [
      { country: "United States", downloads: 150, revenue: 2500 },
      { country: "United Kingdom", downloads: 89, revenue: 1800 },
      { country: "Germany", downloads: 67, revenue: 1200 },
      { country: "Canada", downloads: 45, revenue: 900 },
      { country: "Australia", downloads: 34, revenue: 650 },
    ]
  }

  private buildDateFilter(startDate?: string, endDate?: string, column = "created_at") {
    if (!startDate && !endDate) return null

    let filter = ""
    if (startDate) {
      filter += `${column} >= '${startDate}'`
    }
    if (endDate) {
      if (filter) filter += " AND "
      filter += `${column} <= '${endDate}'`
    }
    return filter
  }
}
