'use client'

import Link from 'next/link'

export function HeroCTA() {
  const sections = [
    {
      label: 'Explore Studio',
      href: '/studio',
      description: 'Photography & visual research',
      icon: '◆',
    },
    {
      label: 'Browse Environments',
      href: '/environments',
      description: '360° immersive spaces',
      icon: '▬',
    },
    {
      label: 'View Realities',
      href: '/realities',
      description: 'Virtual reality experiences',
      icon: '●',
    },
    {
      label: 'Experience Theatre',
      href: '/theatre',
      description: 'Performance & installations',
      icon: '▲',
    },
  ]

  return (
    <section className="w-full px-4 py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Discover Our Work
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group relative overflow-hidden rounded-lg border border-border/30 bg-card/50 p-6 transition-all hover:border-foreground/30 hover:bg-card"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative space-y-3">
                <div className="text-2xl text-foreground/40 group-hover:text-foreground/60 transition-colors">
                  {section.icon}
                </div>
                <h3 className="text-lg font-semibold">{section.label}</h3>
                <p className="text-sm text-foreground/60">{section.description}</p>
                <div className="pt-2 text-xs font-medium text-foreground/50 group-hover:text-foreground/70 transition-colors">
                  Explore →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
