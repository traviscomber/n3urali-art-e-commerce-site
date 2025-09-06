"use client"

import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface BreadcrumbItem {
  label: string
  href: string
}

export function BreadcrumbNav() {
  const pathname = usePathname()

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split("/").filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }]

    let currentPath = ""
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`

      // Convert segment to readable label
      let label = segment.charAt(0).toUpperCase() + segment.slice(1)
      if (segment === "categories") label = "Categories"
      if (segment === "equirectangular") label = "360° Images"
      if (segment === "fisheye") label = "Fisheye"
      if (segment === "gallery") label = "Gallery"
      if (segment === "photo") label = "Photo"
      if (segment === "account") label = "Account"
      if (segment === "orders") label = "My Orders"

      breadcrumbs.push({ label, href: currentPath })
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  if (breadcrumbs.length <= 1) return null

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground py-4">
      {breadcrumbs.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index === 0 && <Home className="w-4 h-4 mr-1" />}
          {index < breadcrumbs.length - 1 ? (
            <Link href={item.href} className="hover:text-primary transition-colors duration-200">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
          {index < breadcrumbs.length - 1 && <ChevronRight className="w-4 h-4 mx-2" />}
        </div>
      ))}
    </nav>
  )
}
