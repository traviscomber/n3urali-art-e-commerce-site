"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function GalleryPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/categories/equirectangular")
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Redirecting to 360° Images...</p>
      </div>
    </div>
  )
}
