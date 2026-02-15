'use client'

interface ContactMethod {
  icon: string
  title: string
  value: string
  link?: string
}

interface ContactMethodsBlockProps {
  methods: ContactMethod[]
}

export function ContactMethodsBlock({ methods }: ContactMethodsBlockProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {methods.map((method, idx) => (
          <div
            key={idx}
            className="p-8 rounded-lg border border-gray-800 hover:border-gray-700 hover:bg-gray-900/50 transition-all group"
          >
            <div className="text-4xl mb-4">{method.icon}</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {method.title}
            </h3>
            {method.link ? (
              <a
                href={method.link}
                className="text-gray-400 hover:text-foreground transition-colors break-all"
              >
                {method.value}
              </a>
            ) : (
              <p className="text-gray-400 break-all">{method.value}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
