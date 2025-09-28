import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About - N3urali.art",
  description: "Learn about N3urali.art - Professional 360° and fisheye imagery for creative professionals.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              About N3urali.art
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
              Revolutionizing
              <span className="text-primary"> Visual Content</span>
              <br />
              for Professionals
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              We're pioneering the future of immersive imagery with cutting-edge AI technology and professional-grade
              360° content.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-6">
                At N3urali.art, we believe that immersive visual content should be accessible, high-quality, and
                professionally crafted. Our mission is to provide creators, architects, and businesses with the tools
                and content they need to bring their visions to life.
              </p>
              <p className="text-muted-foreground">
                Through advanced AI generation and enhancement techniques, we deliver unprecedented quality in 360° and
                fisheye imagery that meets the demanding standards of professional applications.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">What We Offer</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  High-resolution 360° equirectangular imagery
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Professional fisheye lens photography
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  AI-enhanced image quality and detail
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Flexible licensing for commercial use
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Instant downloads and access
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-8 mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Our Technology</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-primary rounded-full"></div>
                </div>
                <h3 className="font-semibold mb-2">AI Enhancement</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced neural networks enhance image quality and detail
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-primary rounded-full"></div>
                </div>
                <h3 className="font-semibold mb-2">Professional Capture</h3>
                <p className="text-sm text-muted-foreground">State-of-the-art equipment for pristine image capture</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-primary rounded-full"></div>
                </div>
                <h3 className="font-semibold mb-2">Quality Assurance</h3>
                <p className="text-sm text-muted-foreground">
                  Rigorous testing ensures every image meets our standards
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of professionals who trust N3urali.art for their immersive content needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/gallery"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Browse Gallery
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
