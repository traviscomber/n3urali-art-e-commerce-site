'use client'

export function BottomCTASection() {
  return (
    <section className="w-full bg-black py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Customers Section */}
        <div className="border-b border-gray-600/60 pb-20">
          <h2 className="text-5xl md:text-6xl font-light text-gray-400">
            Customers
          </h2>
        </div>

        {/* Ready to Blast CTA */}
        <div>
          <h2 className="text-5xl md:text-7xl font-light text-gray-400">
            Ready to Blast?
          </h2>
        </div>
      </div>
    </section>
  )
}
