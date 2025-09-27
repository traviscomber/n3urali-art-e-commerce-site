"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { User, Settings, Download, ShoppingBag, Home } from "lucide-react"

const accountNavItems = [
  {
    title: "Overview",
    href: "/account",
    icon: Home,
  },
  {
    title: "Profile",
    href: "/account/profile",
    icon: User,
  },
  {
    title: "Orders",
    href: "/account/orders",
    icon: ShoppingBag,
  },
  {
    title: "Downloads",
    href: "/account/downloads",
    icon: Download,
  },
  {
    title: "Settings",
    href: "/account/settings",
    icon: Settings,
  },
]

export function AccountNav() {
  const pathname = usePathname()

  return (
    <nav className="flex space-x-1 lg:flex-col lg:space-x-0 lg:space-y-1 mb-6 lg:mb-0">
      {accountNavItems.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
