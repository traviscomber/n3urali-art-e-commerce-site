"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Menu, X } from "lucide-react"
import { useCart } from "@/lib/contexts/cart-context"
import { AuthButton } from "./auth-button"
import { ThemeToggle } from "./theme-toggle"
import Image from "next/image"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { items, toggleCart } = useCart()

  const itemCount = (items || []).reduce((sum, item) => sum + (item.quantity || 0), 0)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-black backdrop-blur-xl supports-[backdrop-filter]:bg-black/95">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center group">
            <div className="relative h-16 w-auto">
              {/* Animated overlay positioned over the neuralia text part of the logo */}
              <div className="absolute top-0 left-0 w-48 h-16 flex items-center justify-center pointer-events-none">
                <div className="w-40 h-12 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 animate-neuralia-pulse opacity-40" />
              </div>
              {/* Animated overlay positioned over the 360° part of the logo */}
              <div className="absolute top-0 right-0 w-12 h-16 flex items-center justify-center pointer-events-none">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 animate-gentle-pulse opacity-60" />
              </div>
              <Image
                src="/images/n3uralia-logo.png"
                alt="n3uralia 360°"
                width={320}
                height={64}
                className="h-16 w-auto object-contain group-hover:opacity-80 transition-opacity duration-300"
                priority
              />
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-12">
            <Link
              href="/categories/equirectangular"
              className="relative text-sm font-medium text-gray-300 hover:text-primary transition-all duration-300 group"
            >
              360° Images
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              href="/categories/fisheye"
              className="relative text-sm font-medium text-gray-300 hover:text-primary transition-all duration-300 group"
            >
              Fisheye
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              href="/account/orders"
              className="relative text-sm font-medium text-gray-300 hover:text-primary transition-all duration-300 group"
            >
              My Orders
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {/* Cart Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleCart}
              className="relative bg-card/50 border-border/50 hover:bg-card hover:glow-accent transition-all duration-300"
            >
              <ShoppingCart className="h-4 w-4" />
              {itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground animate-pulse-glow">
                  {itemCount}
                </Badge>
              )}
            </Button>

            <AuthButton />

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden hover:bg-card/50 transition-all duration-300 text-white hover:text-primary"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/20 py-6 bg-black/95 backdrop-blur-sm rounded-b-lg">
            <nav className="flex flex-col space-y-6">
              <Link
                href="/categories/equirectangular"
                className="text-base font-medium text-gray-300 hover:text-primary transition-colors px-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                360° Images
              </Link>
              <Link
                href="/categories/fisheye"
                className="text-base font-medium text-gray-300 hover:text-primary transition-colors px-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Fisheye
              </Link>
              <Link
                href="/account/orders"
                className="text-base font-medium text-gray-300 hover:text-primary transition-colors px-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Orders
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
