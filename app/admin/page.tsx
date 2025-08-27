import { AdminDashboardOverview } from "@/components/admin-dashboard-overview"

export const dynamic = "force-dynamic"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
        </div>
      </div>

      <AdminDashboardOverview />
    </div>
  )
}
