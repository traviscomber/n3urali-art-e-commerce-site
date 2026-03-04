import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // Allow if user is admin or if email is travis@nuanu.com
  const isAdmin = profile?.role === "admin" || user.email === "travis@nuanu.com"
  
  if (!isAdmin) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <Button variant="ghost" asChild>
                <Link href="/admin">Dashboard</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/admin/simple-admin">Upload Videos</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/admin/videos">Videos Manager</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/admin/featured-images">Featured Images</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/">Back to Site</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}
