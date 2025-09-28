import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Page Not Found | N3urali.art",
  description: "The page you're looking for doesn't exist on N3urali.art - Premium 360° Digital Photography platform.",
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist on N3urali.art. Explore our premium 360° digital photography
          collection instead.
        </p>
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/">Return to Homepage</Link>
          </Button>
          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href="/gallery">Browse Gallery</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
