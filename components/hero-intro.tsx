'use client'

import { useLanguage } from '@/lib/contexts/language-context'

export function HeroIntro() {
  const { t } = useLanguage()

  return (
    <section className="w-full bg-gradient-to-b from-background via-background/95 to-background px-4 py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Immersive Worlds
            <br />
            Cultural Stories
          </h1>
          <p className="text-lg text-foreground/70 leading-relaxed text-balance">
            We create immersive experiences across dome installations, VR environments, performance loops, and spatial media. 
            Each work begins with deep cultural research and unfolds through collaborative artistic vision.
          </p>
        </div>

        <div className="grid gap-4 pt-8 sm:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground/60">Our Practice</h3>
            <p className="text-sm text-foreground/50">
              360° photography, cultural storytelling, immersive installations, and spatial media design.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground/60">For Institutions</h3>
            <p className="text-sm text-foreground/50">
              Museums, planetariums, and cultural centers. Commission custom experiences tailored to your space.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
