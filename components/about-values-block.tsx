'use client'

interface Value {
  icon: string
  title: string
  description: string
}

interface AboutValuesBlockProps {
  values: Value[]
}

export function AboutValuesBlock({ values }: AboutValuesBlockProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 border-t border-gray-800">
      <div className="space-y-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Our Values
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors group"
            >
              <div className="text-4xl mb-4">{value.icon}</div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {value.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
