import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function OrdersLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-8 bg-muted rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
      </div>
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <div className="h-5 bg-muted rounded w-32 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-48"></div>
                </div>
                <div className="h-6 bg-muted rounded w-20"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-16 bg-muted rounded"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
