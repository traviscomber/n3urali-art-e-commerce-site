import type { Metadata } from "next"
import { ContactHeroBlock } from "@/components/contact-hero-block"
import { ContactMethodsBlock } from "@/components/contact-methods-block"
import { ContactFormBlock } from "@/components/contact-form-block"
import { ContactFAQBlock } from "@/components/contact-faq-block"

export const metadata: Metadata = {
  title: "Contact N3uralia360",
  description: "Get in touch with N3uralia360 for commissions, inquiries, and partnerships.",
  keywords: ["contact", "commission", "inquiry", "partnership"],
}

export default function ContactPage() {
  const contactMethods = [
    {
      icon: "✉️",
      title: "Email",
      value: "hello@n3uralia360.art",
      link: "mailto:hello@n3uralia360.art",
    },
    {
      icon: "📱",
      title: "Phone",
      value: "+1 (555) 123-4567",
    },
    {
      icon: "🌐",
      title: "Visit Us",
      value: "www.n3uralia360.art",
      link: "https://n3uralia360.art",
    },
  ]

  const faqs = [
    {
      question: "What is the typical timeline for a commission?",
      answer:
        "Commission timelines depend on scope and complexity. Most projects take 3-6 months from initial brief to final delivery. We'll provide a detailed timeline after the discovery phase.",
    },
    {
      question: "Do you work with international clients?",
      answer:
        "Yes, we work with cultural institutions, museums, and brands worldwide. We have experience with projects across multiple continents.",
    },
    {
      question: "What formats can you deliver in?",
      answer:
        "We deliver in all major formats: 360 equirectangular, fisheye, dome-optimized, VR-ready, and performance loops. We also create social media cuts and promotional materials.",
    },
    {
      question: "How do commissions start?",
      answer:
        "Start by filling out our contact form or emailing us directly. We'll schedule a discovery call to understand your vision, venue, and requirements.",
    },
  ]

  return (
    <main className="min-h-screen w-full bg-background">
      <ContactHeroBlock
        title="Get in Touch"
        subtitle="We'd love to hear about your project or inquiry. Reach out to us through any of the methods below."
      />

      <ContactMethodsBlock methods={contactMethods} />

      <ContactFormBlock />

      <ContactFAQBlock faqs={faqs} />
    </main>
  )
}
