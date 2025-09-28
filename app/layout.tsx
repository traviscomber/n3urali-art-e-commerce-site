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
    "AI generated 360 images",
    "professional VR content",
    "what is 360 degree photography",
    "how to use equirectangular images",
    "best VR imagery for projects",
  ],
  authors: [{ name: "N3urali.art" }],
  creator: "N3urali.art",
  publisher: "N3urali.art",
  verification: {
    google: "your-google-verification-code",
  },
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
    url: "https://n3uralia360.art",
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
    canonical: "https://n3uralia360.art",
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "N3urali.art",
              url: "https://n3uralia360.art",
              logo: "https://n3uralia360.art/logo.png",
              description:
                "Professional AI-generated 360° photography and immersive imagery for VR, projection mapping, and architectural visualization.",
              foundingDate: "2024",
              industry: "Digital Photography",
              speciality: [
                "360° Photography",
                "AI-Generated Imagery",
                "VR Content",
                "Projection Mapping",
                "Architectural Visualization",
              ],
              serviceArea: "Worldwide",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+1-555-0123",
                contactType: "Customer Service",
                email: "hello@n3urali.art",
                availableLanguage: "English",
              },
              address: {
                "@type": "PostalAddress",
                addressLocality: "San Francisco",
                addressRegion: "CA",
                addressCountry: "US",
              },
              sameAs: ["https://n3uralia360.art"],
              offers: {
                "@type": "Offer",
                category: "360° Photography Services",
                description:
                  "Professional AI-generated 360° equirectangular and fisheye imagery with flexible licensing options",
              },
            }),
          }}
        />
      </head>
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
