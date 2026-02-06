import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Studio Process | N3uralia360',
  description: 'Discover our immersive content creation process: Cultural Research → Worldbuilding → Art Direction → Format Translation',
}

export default function StudioProcessPage() {
  const steps = [
    {
      number: 1,
      title: 'Cultural Research',
      description: 'Deep exploration of cultural narratives, mythology, and artistic traditions',
      details: 'We collaborate with cultural advisors, historians, and community leaders to authentically represent cultural stories.',
    },
    {
      number: 2,
      title: 'Worldbuilding',
      description: 'Creation of immersive environments and narrative frameworks',
      details: 'Visual language, color palettes, spatial design, and interactive elements are carefully crafted.',
    },
    {
      number: 3,
      title: 'Art Direction',
      description: 'Development of visual aesthetics and cinematic direction',
      details: 'Mood, lighting, composition, and artistic vision guide the immersive experience.',
    },
    {
      number: 4,
      title: 'Format Translation',
      description: 'Adaptation across multiple platforms and venues',
      details: 'Dome films, VR environments, performance loops, and social content—each optimized for its context.',
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
            How We Create Immersive Works
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            A human-led creative process that transforms cultural narratives into borderless immersive experiences
          </p>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex gap-8">
                {/* Step Number */}
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-1 h-12 bg-primary/20 mx-auto mt-4" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 pb-8">
                  <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                  <p className="text-lg text-muted-foreground mb-3">{step.description}</p>
                  <p className="text-base text-muted-foreground">{step.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Commission an Immersive Work?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            We work with museums, cultural institutions, brands, and creative organizations to bring unique stories to life.
          </p>
          <Link href="/commission">
            <Button size="lg" className="text-lg">
              Start a Commission
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
