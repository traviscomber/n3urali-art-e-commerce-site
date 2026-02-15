'use client'

interface Stat {
  number: string | number
  label: string
}

interface AboutStatsBlockProps {
  stats: Stat[]
}

export function AboutStatsBlock({ stats }: AboutStatsBlockProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 border-t border-gray-800">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
        {stats.map((stat, idx) => (
          <div key={idx} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {stat.number}
            </div>
            <p className="text-sm md:text-base text-gray-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
