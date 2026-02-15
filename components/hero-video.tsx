'use client'

export function HeroVideo() {
  return (
    <section className="w-full px-4 py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
          <div className="relative h-full w-full bg-gradient-to-br from-foreground/10 to-foreground/5 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-foreground/10 backdrop-blur-sm mb-4">
                <svg className="w-8 h-8 text-foreground/60" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
              <p className="text-sm text-foreground/50">Featured Experience</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
