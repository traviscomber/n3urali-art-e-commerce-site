'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'

export default function StudioPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            N3uralia360 Studio
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            We are a cultural immersive media studio. We author experiences—not generate them. Each work represents deep cultural research, 
            collaborative artistic vision, and meticulous craft across multiple formats. We believe immersive media should preserve heritage, 
            celebrate artistic expression, and create genuine human connection.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/studio/process">
              <Button size="lg" className="w-full sm:w-auto">
                Our Creative Process
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/commission">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                Commission a Work
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Our Philosophy</h2>
          <p className="text-muted-foreground max-w-2xl">
            Immersive media is a medium for truth-telling. Whether preserving endangered cultural heritage or exploring speculative futures, 
            we work with intentionality, respect, and artistic rigor.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 border-2 hover:border-primary transition-colors">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-primary">🌍</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Research</h3>
            <p className="text-muted-foreground">
              Deep cultural immersion and collaboration with communities, historians, and cultural authorities to authentically ground each work.
            </p>
          </Card>

          <Card className="p-6 border-2 hover:border-primary transition-colors">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-primary">🎨</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Authorship</h3>
            <p className="text-muted-foreground">
              Human-led creative direction with careful attention to visual language, narrative structure, and aesthetic integrity across all formats.
            </p>
          </Card>

          <Card className="p-6 border-2 hover:border-primary transition-colors">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-primary">🔄</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Translation</h3>
            <p className="text-muted-foreground">
              Each work is adapted across venues and platforms—dome installations, VR environments, performance loops, social media—each optimized for its context.
            </p>
          </Card>
        </div>
      </section>

      {/* Works CTA */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Explore Our Works</h2>
            <p className="text-muted-foreground mb-6">
              Browse our curated collection of immersive works created through this process. 
              Each represents months of research, artistic collaboration, and technical refinement.
            </p>
            <Link href="/works">
              <Button size="lg">
                View All Works
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="aspect-square rounded-lg bg-muted border border-border flex items-center justify-center">
              <p className="text-muted-foreground text-center px-4">Films</p>
            </div>
            <div className="aspect-square rounded-lg bg-muted border border-border flex items-center justify-center">
              <p className="text-muted-foreground text-center px-4">Environments</p>
            </div>
            <div className="aspect-square rounded-lg bg-muted border border-border flex items-center justify-center">
              <p className="text-muted-foreground text-center px-4">Performance Loops</p>
            </div>
            <div className="aspect-square rounded-lg bg-muted border border-border flex items-center justify-center">
              <p className="text-muted-foreground text-center px-4">Social Cuts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Commission CTA */}
      <section className="container mx-auto px-4 py-20 border-t border-border mb-12">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20 p-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Commission an Immersive Work</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Museums, planetariums, cultural institutions, and brands can commission custom immersive works. 
            We work with you to create narratives and experiences tailored to your vision and venue.
          </p>
          <Link href="/commission">
            <Button size="lg">
              Start a Commission
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
