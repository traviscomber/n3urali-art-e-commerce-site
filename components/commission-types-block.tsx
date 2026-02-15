'use client'

interface CommissionType {
  icon: string
  title: string
  description: string
}

interface CommissionTypesBlockProps {
  types: CommissionType[]
}

export function CommissionTypesBlock({ types }: CommissionTypesBlockProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="space-y-8">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Commission Types
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {types.map((type, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg border border-gray-800 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group"
            >
              <div className="text-4xl mb-4">{type.icon}</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {type.title}
              </h3>
              <p className="text-sm text-gray-400">
                {type.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
