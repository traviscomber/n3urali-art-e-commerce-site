import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/lib/contexts/cart-context"
import { Header } from "@/components/header"
import { CartSidebar } from "@/components/cart-sidebar"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "n3urali.art - Premium 360° & Fisheye Images",
  description: "Professional equirectangular and fisheye images for VR, projection mapping, and immersive experiences",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
      <body>
        <CartProvider>
          <Header />
          {children}
          <CartSidebar />
        </CartProvider>
      </body>
    </html>
  )
}
