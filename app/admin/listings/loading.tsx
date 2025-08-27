import { Loader2 } from "lucide-react"

export default function AdminListingsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-muted-foreground">Loading listing management...</span>
      </div>
    </div>
  )
}
