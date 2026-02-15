'use client'

interface PricingTier {
  name: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
}

interface CommissionPricingBlockProps {
  tiers: PricingTier[]
}

export function CommissionPricingBlock({ tiers }: CommissionPricingBlockProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 border-t border-gray-800">
      <div className="space-y-8">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Commission Packages
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`rounded-lg border p-8 flex flex-col ${
                tier.highlighted
                  ? 'border-orange-500/50 bg-orange-500/5'
                  : 'border-gray-800 bg-gray-900/50'
              }`}
            >
              <h3 className="text-2xl font-semibold text-foreground mb-2">
                {tier.name}
              </h3>
              <p className="text-gray-400 text-sm mb-6">{tier.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">
                  {tier.price}
                </span>
              </div>

              <ul className="space-y-3 flex-grow mb-8">
                {tier.features.map((feature, featureIdx) => (
                  <li
                    key={featureIdx}
                    className="flex items-start gap-3 text-gray-300 text-sm"
                  >
                    <span className="text-orange-400 mt-1">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  tier.highlighted
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'border border-gray-700 text-foreground hover:bg-gray-800'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
