import type { Metadata } from "next"
import { FAQSection } from "@/components/faq-section"

export const metadata: Metadata = {
  title: "FAQ — n3uralia360",
  description: "Frequently asked questions about N3uralia360's immersive environments, licensing, support, and commissioning services.",
  keywords: ["FAQ", "help", "support", "licensing", "environments", "immersive art"],
}

export default function FAQPage() {
  return (
    <main className="min-h-screen w-full bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Find answers to common questions about our immersive environments, licensing, and services.
          </p>
        </div>
        <FAQSection />
      </div>
    </main>
  )
}
