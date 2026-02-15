'use client'

import Link from 'next/link'

export function CommissionBlock() {
  return (
    <section className="w-full py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-background border-t border-border">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 text-pretty">
            Commission Immersive Experiences
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Work with us to create custom cultural narratives and immersive experiences for museums, galleries, dome
            installations, and theatrical venues.
          </p>
        </div>

        {/* Testimonial/Quote Section */}
        <div className="bg-muted/50 rounded-xl p-8 lg:p-12 mb-12 border border-border">
          <blockquote className="space-y-6">
            <p className="text-lg lg:text-xl text-foreground leading-relaxed italic">
              &quot;N3uralia brought our cultural vision to life through immersive technology. Their understanding of
              storytelling and technical excellence created an unforgettable experience for our audience.&quot;
            </p>
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-foreground">Director, Cultural Institution</p>
              <p className="text-muted-foreground">International Museum Network</p>
            </div>
          </blockquote>
        </div>

        {/* Commission Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              number: '01',
              title: 'Discovery',
              description: 'We explore your cultural narrative, venue, and audience to understand your vision.',
            },
            {
              number: '02',
              title: 'Create',
              description: 'Our team develops immersive content tailored to your space and cultural context.',
            },
            {
              number: '03',
              title: 'Install',
              description: 'We handle technical setup and ensure seamless integration into your venue.',
            },
          ].map((step) => (
            <div key={step.number} className="text-center">
              <div className="text-4xl font-bold text-accent mb-3">{step.number}</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Link
            href="/commission"
            className="px-10 py-4 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition-all duration-300 transform hover:scale-105 text-lg"
          >
            Start Your Commission
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-12 p-6 lg:p-8 bg-muted/30 rounded-lg border border-border">
          <p className="text-center text-muted-foreground">
            Interested in learning more? Contact our team to discuss your project requirements, budget, and timeline.
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Link
              href="/contact"
              className="text-accent font-semibold hover:underline"
            >
              Get in Touch
            </Link>
            <span className="text-muted-foreground">•</span>
            <a
              href="mailto:commissions@n3uralia360.art"
              className="text-accent font-semibold hover:underline"
            >
              Email Us
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
