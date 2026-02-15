import type { Metadata } from "next"
import { AboutHeroBlock } from "@/components/about-hero-block"
import { AboutStoryBlock } from "@/components/about-story-block"
import { AboutValuesBlock } from "@/components/about-values-block"
import { AboutStatsBlock } from "@/components/about-stats-block"

export const metadata: Metadata = {
  title: "About N3uralia360 - Immersive Media Studio",
  description: "N3uralia360 is a cultural immersive media studio creating experiences across dome installations, VR environments, performance loops, and spatial media.",
  keywords: ["about N3uralia360", "immersive media", "360 photography", "cultural storytelling", "dome installation", "VR experience"],
}

export default function AboutPage() {
  const values = [
    {
      icon: "🌍",
      title: "Cultural Research",
      description: "Deep cultural immersion and collaboration with communities to authentically ground each work.",
    },
    {
      icon: "🎨",
      title: "Human Authorship",
      description: "Creative direction with careful attention to visual language, narrative structure, and aesthetic integrity.",
    },
    {
      icon: "🔄",
      title: "Artistic Translation",
      description: "Each work is adapted across venues and platforms, optimized for its unique context and purpose.",
    },
  ]

  const stats = [
    { number: "4+", label: "Years Creating" },
    { number: "100+", label: "Works Produced" },
    { number: "50+", label: "Collections" },
    { number: "∞", label: "Immersive Possibilities" },
  ]

  const storyContent = [
    "N3uralia360 is a cultural immersive media studio. We author experiences—not generate them. Each work represents deep cultural research, collaborative artistic vision, and meticulous craft across multiple formats.",
    "We believe immersive media should preserve heritage, celebrate artistic expression, and create genuine human connection. Whether preserving endangered cultural narratives or exploring speculative futures, we work with intentionality, respect, and artistic rigor.",
    "Our team includes artists, technologists, and cultural researchers who collaborate on every project. We create experiences that transcend traditional boundaries between physical and digital, creating new cultural dimensions.",
  ]

  return (
    <main className="min-h-screen w-full bg-background">
      <AboutHeroBlock
        title="About N3uralia360"
        subtitle="We are a cultural immersive media studio, authoring experiences across dome installations, VR environments, performance loops, and spatial media."
      />

      <AboutStoryBlock
        title="Our Story"
        content={storyContent}
      />

      <AboutValuesBlock values={values} />

      <AboutStatsBlock stats={stats} />
    </main>
  )
}
