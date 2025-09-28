import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { CartProvider } from "@/lib/contexts/cart-context"
import { AuthProvider } from "@/lib/contexts/auth-context"
import { TagFilterProvider } from "@/lib/contexts/tag-filter-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { CartSidebar } from "@/components/cart-sidebar"
import { ToastProvider } from "@/components/toast-notifications"

export const metadata: Metadata = {
  title: {
    default: "N3urali.art - Premium 360° Digital Photography",
    template: "%s | N3urali.art",
  },
  description:
    "Discover our curated collection of equirectangular and fisheye images, perfect for projection mapping, VR experiences, and architectural visualization.",
  keywords: [
    "360 photography",
    "equirectangular",
    "fisheye",
    "VR",
    "projection mapping",
    "architectural visualization",
    "immersive imagery",
    "panoramic photography",
  ],
  authors: [{ name: "N3urali.art" }],
  creator: "N3urali.art",
  publisher: "N3urali.art",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://n3urali.art",
    siteName: "N3urali.art",
    title: "N3urali.art - Premium 360° Digital Photography",
    description:
      "Discover our curated collection of equirectangular and fisheye images, perfect for projection mapping, VR experiences, and architectural visualization.",
  },
  twitter: {
    card: "summary_large_image",
    title: "N3urali.art - Premium 360° Digital Photography",
    description:
      "Discover our curated collection of equirectangular and fisheye images, perfect for projection mapping, VR experiences, and architectural visualization.",
  },
  alternates: {
    canonical: "https://n3urali.art",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <CartProvider>
              <TagFilterProvider>
                <ToastProvider>
                  <Header />
                  {children}
                  <CartSidebar />
                </ToastProvider>
              </TagFilterProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
