"use client"

import { useState } from "react"
import Link from "next/link"
import { useLanguage } from "@/lib/contexts/language-context"
import { Mail, MapPin, Clock } from "lucide-react"
import { EmailContactModal } from "./email-contact-modal"

export function Footer() {
  const { t } = useLanguage()
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      titleKey: "footer.exploreTitle",
      links: [
        { labelKey: "footer.gallery", href: "/gallery" },
        { labelKey: "footer.collections", href: "/collection" },
        { labelKey: "footer.allWorks", href: "/all" },
        { labelKey: "footer.theatreMode", href: "/theatre" },
      ],
    },
    {
      titleKey: "footer.aboutTitle",
      links: [
        { labelKey: "footer.aboutN3uralia", href: "/about" },
        { labelKey: "footer.studioProcess", href: "/studio/process" },
        { labelKey: "footer.commission", href: "/commission" },
        { labelKey: "footer.contact", href: "/contact" },
      ],
    },
    {
      titleKey: "footer.legalTitle",
      links: [
        { labelKey: "footer.licensingTerms", href: "/licensing-terms" },
        { labelKey: "footer.licensingContract", href: "/licensing-contract" },
      ],
    },
    {
      titleKey: "footer.accountTitle",
      links: [
        { labelKey: "footer.profile", href: "/account/profile" },
        { labelKey: "footer.orders", href: "/account/orders" },
        { labelKey: "footer.downloads", href: "/account/downloads" },
        { labelKey: "footer.settings", href: "/account/settings" },
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
              {t("footer.brandDescription")}
            </p>
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                <button
                  onClick={() => setEmailModalOpen(true)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  info@n3uralia360.art
                </button>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">n3uralia360.art</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{t("footer.available247")}</span>
              </div>
            </div>
          </div>

          {/* Navigation Sections */}
          {footerSections.map((section) => (
            <div key={section.titleKey}>
              <h4 className="font-semibold text-sm mb-4">{t(section.titleKey)}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      {t(link.labelKey)}
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
              <Link href="/licensing-terms" className="text-xs text-primary hover:text-primary/80 transition-colors font-medium">
                Terms
              </Link>
              <span className="text-xs text-primary/60">•</span>
              <Link href="/contact" className="text-xs text-primary hover:text-primary/80 transition-colors font-medium">
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

      {/* Email Contact Modal */}
      <EmailContactModal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} />
    </footer>
  )
}
