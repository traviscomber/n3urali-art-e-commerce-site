import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { CartProvider } from "@/lib/contexts/cart-context"
import { AuthProvider } from "@/lib/contexts/auth-context"
import { Header } from "@/components/header"
import { CartSidebar } from "@/components/cart-sidebar"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body>
        <AuthProvider>
          <CartProvider>
            <Header />
            {children}
            <CartSidebar />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
