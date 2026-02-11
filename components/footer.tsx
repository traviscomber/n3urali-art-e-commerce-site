"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/contexts/language-context"
import { Mail, MapPin, Clock } from "lucide-react"

export function Footer() {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: "Explore",
      links: [
        { label: "Gallery", href: "/gallery" },
        { label: "Collections", href: "/collection" },
        { label: "All Works", href: "/all" },
        { label: "Theatre Mode", href: "/theatre" },
      ],
    },
    {
      title: "About",
      links: [
        { label: "About N3uralia360", href: "/about" },
        { label: "Studio Process", href: "/studio/process" },
        { label: "Commission", href: "/commission" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Licensing Terms", href: "/licensing-terms" },
        { label: "Licensing Contract", href: "/licensing-contract" },
      ],
    },
    {
      title: "Account",
      links: [
        { label: "Profile", href: "/account/profile" },
        { label: "Orders", href: "/account/orders" },
        { label: "Downloads", href: "/account/downloads" },
        { label: "Settings", href: "/account/settings" },
      ],
    },
  ]

  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold mb-4">N3uralia360</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Cultural immersive media studio creating experiences across dome installations, VR environments, and spatial media.
            </p>
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                <a
                  href="mailto:info@n3uralia360.art"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  info@n3uralia360.art
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">n3uralia360.art</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Available 24/7</span>
              </div>
            </div>
          </div>

          {/* Navigation Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-sm mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t pt-8 mt-8">
          {/* Copyright & Links */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {currentYear} N3uralia360. All rights reserved. | Cultural immersive media studio creating experiences across dome installations, VR environments, performance loops, and spatial media.
            </p>
            <div className="flex gap-4">
              <Link href="/licensing-terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <span className="text-xs text-muted-foreground">•</span>
              <Link href="/contact" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Data for SEO/GEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "N3uralia360",
            url: "https://www.n3uralia360.art",
            logo: "https://www.n3uralia360.art/images/n3uralia-logo.png",
            description:
              "Cultural immersive media studio creating experiences across dome installations, VR environments, performance loops, and spatial media.",
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "Customer Service",
              email: "info@n3uralia360.art",
              availableLanguage: ["English", "Spanish"],
              areaServed: "Worldwide",
            },
            address: {
              "@type": "PostalAddress",
              url: "https://www.n3uralia360.art",
            },
            sameAs: [
              "https://www.n3uralia360.art/about",
              "https://www.n3uralia360.art/gallery",
            ],
          }),
        }}
      />
    </footer>
  )
}
