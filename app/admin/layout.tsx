import type React from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-6">
          <h1 className="text-xl font-semibold">n3urali.art Admin</h1>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
