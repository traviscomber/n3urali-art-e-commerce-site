"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/simple-admin")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Redirecting to Admin Dashboard...</h1>
        <p className="text-gray-600">Please wait while we redirect you to the admin interface.</p>
      </div>
    </div>
  )
}
