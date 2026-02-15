'use client'

interface AboutHeroBlockProps {
  title: string
  subtitle: string
}

export function AboutHeroBlock({ title, subtitle }: AboutHeroBlockProps) {
  return (
    <section className="w-full py-20 md:py-32 bg-gradient-to-br from-foreground/5 to-background border-b border-gray-800">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground text-balance leading-tight">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  )
}
