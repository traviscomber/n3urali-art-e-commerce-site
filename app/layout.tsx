import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { CartProvider } from "@/lib/contexts/cart-context"
import { AuthProvider } from "@/lib/contexts/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { CartSidebar } from "@/components/cart-sidebar"
import { ToastProvider } from "@/components/toast-notifications"
import { ErrorBoundary } from "@/components/error-boundary"

export const metadata: Metadata = {
  title: {
    default: "N3urali.art - Premium 360° Digital Photography & AI-Generated Imagery",
    template: "%s | N3urali.art",
  },
  description:
    "Discover premium equirectangular and fisheye 360° images perfect for VR, projection mapping, and architectural visualization. AI-generated and professionally enhanced imagery from 4K to 16K resolution.",
  keywords: [
    "360 photography",
    "equirectangular images",
    "fisheye photography",
    "VR content",
    "projection mapping",
    "AI generated imagery",
    "architectural visualization",
    "immersive media",
    "digital art",
    "premium photography",
  ],
  authors: [{ name: "N3urali.art", url: "https://n3urali.com" }],
  creator: "N3urali.art",
  publisher: "N3urali.art",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://n3urali.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://n3urali.com",
    siteName: "N3urali.art",
    title: "N3urali.art - Premium 360° Digital Photography & AI-Generated Imagery",
    description:
      "Discover premium equirectangular and fisheye 360° images perfect for VR, projection mapping, and architectural visualization. AI-generated and professionally enhanced imagery.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "N3urali.art - Premium 360° Digital Photography",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "N3urali.art - Premium 360° Digital Photography",
    description:
      "Discover premium equirectangular and fisheye 360° images perfect for VR, projection mapping, and architectural visualization.",
    images: ["/og-image.jpg"],
    creator: "@n3urali",
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
  verification: {
    google: "your-google-verification-code",
  },
  category: "Digital Art & Photography",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://n3urali.com/#organization",
                  name: "N3urali.art",
                  url: "https://n3urali.com",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://n3urali.com/logo.png",
                    width: 512,
                    height: 512,
                  },
                  description: "Premium 360° digital photography and AI-generated imagery for professionals",
                  sameAs: ["https://twitter.com/n3urali", "https://instagram.com/n3urali.art"],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://n3urali.com/#website",
                  url: "https://n3urali.com",
                  name: "N3urali.art",
                  description: "Premium 360° digital photography and AI-generated imagery",
                  publisher: {
                    "@id": "https://n3urali.com/#organization",
                  },
                  potentialAction: [
                    {
                      "@type": "SearchAction",
                      target: {
                        "@type": "EntryPoint",
                        urlTemplate: "https://n3urali.com/browse?search={search_term_string}",
                      },
                      "query-input": "required name=search_term_string",
                    },
                  ],
                },
              ],
            }),
          }}
        />
        <link rel="canonical" href="https://n3urali.com" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <AuthProvider>
              <CartProvider>
                <ToastProvider>
                  <Header />
                  {children}
                  <CartSidebar />
                </ToastProvider>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
