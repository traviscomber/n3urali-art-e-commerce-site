import type { Metadata } from "next"
import { CommissionHeroBlock } from "@/components/commission-hero-block-page"
import { CommissionTypesBlock } from "@/components/commission-types-block"
import { CommissionProcessBlock } from "@/components/commission-process-block"
import { CommissionPricingBlock } from "@/components/commission-pricing-block"
import { ContactFormBlock } from "@/components/contact-form-block"

export const metadata: Metadata = {
  title: "Commission Custom Immersive Works - N3uralia360",
  description: "Commission custom immersive experiences from N3uralia360. Dome installations, VR environments, performance loops, and spatial media for museums, institutions, and brands.",
}

export const dynamic = 'force-dynamic'

export default function CommissionPage() {
  const commissionTypes = [
    {
      icon: "🏛️",
      title: "Dome Installation",
      description: "Full-dome immersive experiences for planetariums, museums, and cultural venues.",
    },
    {
      icon: "🥽",
      title: "VR Experience",
      description: "Room-scale and headset-based VR environments for interactive storytelling.",
    },
    {
      icon: "🎬",
      title: "Performance Loop",
      description: "Seamless atmospheric loops optimized for live venue integration.",
    },
    {
      icon: "🎨",
      title: "Custom Format",
      description: "Tailored solutions for unique spatial and technical requirements.",
    },
  ]

  const processSteps = [
    {
      number: 1,
      title: "Discovery",
      description: "We understand your vision, venue, audience, and cultural context.",
    },
    {
      number: 2,
      title: "Research",
      description: "Deep cultural research and collaborative planning with stakeholders.",
    },
    {
      number: 3,
      title: "Design",
      description: "Creative direction, visual language development, and technical specification.",
    },
    {
      number: 4,
      title: "Production",
      description: "Creation, iteration, and refinement of the immersive experience.",
    },
    {
      number: 5,
      title: "Delivery",
      description: "Final files, technical support, and venue integration assistance.",
    },
  ]

  const pricingTiers = [
    {
      name: "Emerging",
      price: "Starting at $15k",
      description: "Perfect for smaller venues and experimental projects",
      features: [
        "Single format delivery",
        "Up to 3 revisions",
        "Technical consultation",
        "3-month timeline",
      ],
    },
    {
      name: "Professional",
      price: "Starting at $50k",
      description: "Ideal for museums and cultural institutions",
      features: [
        "Multiple format delivery",
        "Unlimited revisions",
        "Full technical support",
        "4-6 month timeline",
        "Marketing assets",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom Quote",
      description: "Large-scale projects and multi-venue installations",
      features: [
        "Complete customization",
        "Dedicated project team",
        "On-site support",
        "Extended timeline",
        "Training & documentation",
      ],
    },
  ]

  return (
    <main className="min-h-screen w-full bg-background">
      <CommissionHeroBlock
        title="Commission Custom Immersive Experiences"
        subtitle="Transform your vision into immersive reality. We create experiences for museums, planetariums, cultural institutions, and brands worldwide."
      />

      <CommissionTypesBlock types={commissionTypes} />

      <CommissionProcessBlock steps={processSteps} />

      <CommissionPricingBlock tiers={pricingTiers} />

      <div className="border-t border-gray-800">
        <ContactFormBlock />
      </div>
    </main>
  )
}
