'use client'

interface ProcessStep {
  number: number
  title: string
  description: string
}

interface CommissionProcessBlockProps {
  steps: ProcessStep[]
}

export function CommissionProcessBlock({
  steps,
}: CommissionProcessBlockProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 border-t border-gray-800">
      <div className="space-y-8">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Our Process
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((step, idx) => (
            <div key={idx} className="relative">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20 border border-orange-500/50">
                      <span className="text-lg font-bold text-orange-400">
                        {step.number}
                      </span>
                    </div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-6 left-20 w-8 h-0.5 bg-gradient-to-r from-orange-500/50 to-transparent" />
                  )}
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-400 flex-grow">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
