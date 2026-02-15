'use client'

export function SectionOrganizer() {
  const sections = [
    {
      title: 'Gallery',
      description: 'Browse our complete collection of immersive works',
      link: '/gallery',
    },
    {
      title: 'Collections',
      description: 'Curated collections organized by theme and experience',
      link: '/collection',
    },
    {
      title: 'About',
      description: 'Learn more about n3uralia360 and our artistic practice',
      link: '/about',
    },
  ]

  return (
    <section className="w-full px-4 py-16 sm:py-24 lg:py-32 border-t border-border/20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-3">
          {sections.map((section) => (
            <a
              key={section.link}
              href={section.link}
              className="group space-y-3 p-4 rounded-lg transition-colors hover:bg-card/50"
            >
              <h3 className="text-lg font-semibold group-hover:text-foreground/80 transition-colors">{section.title}</h3>
              <p className="text-sm text-foreground/60 group-hover:text-foreground/70 transition-colors">
                {section.description}
              </p>
              <div className="inline-block text-xs font-medium text-foreground/50 group-hover:text-foreground/70 transition-colors">
                Explore →
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
