export const dynamic = "force-dynamic"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Simple admin interface for n3urali.art</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">Image Management</h3>
          <p className="text-sm text-muted-foreground mt-2">Upload and manage your 360° and fisheye images</p>
          <div className="mt-4">
            <p className="text-sm">Coming soon - basic image upload functionality</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">Orders</h3>
          <p className="text-sm text-muted-foreground mt-2">View and manage customer orders</p>
          <div className="mt-4">
            <p className="text-sm">Coming soon - order management</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">Downloads</h3>
          <p className="text-sm text-muted-foreground mt-2">Track customer downloads</p>
          <div className="mt-4">
            <p className="text-sm">Coming soon - download tracking</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <p className="text-sm">• Set up your Supabase database tables</p>
          <p className="text-sm">• Configure image storage</p>
          <p className="text-sm">• Test payment processing</p>
        </div>
      </div>
    </div>
  )
}
