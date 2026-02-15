'use client'

interface AboutStoryBlockProps {
  title: string
  content: string[]
}

export function AboutStoryBlock({ title, content }: AboutStoryBlockProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="space-y-8">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          {title}
        </h2>

        <div className="space-y-6">
          {content.map((paragraph, idx) => (
            <p
              key={idx}
              className="text-lg text-gray-300 leading-relaxed max-w-3xl"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
