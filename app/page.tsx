import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Eye, Download, Shield, HelpCircle } from "lucide-react"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata: Metadata = {
  title: "N3urali.art - Premium 360° Digital Photography & AI-Generated Imagery",
  description:
    "Discover our curated collection of AI-generated equirectangular and fisheye images, perfect for projection mapping, VR experiences, and architectural visualization. Professional quality 4K-16K resolution.",
  keywords: [
    "360 photography",
    "AI generated imagery",
    "equirectangular",
    "fisheye",
    "VR",
    "projection mapping",
    "architectural visualization",
    "immersive imagery",
    "panoramic photography",
    "4K",
    "8K",
    "16K",
    "what is 360 degree photography",
    "how to use equirectangular images",
    "best VR content creation",
    "professional immersive imagery",
    "AI generated panoramic photos",
  ],
  openGraph: {
    title: "N3urali.art - Premium 360° Digital Photography & AI-Generated Imagery",
    description:
      "Discover our curated collection of AI-generated equirectangular and fisheye images, perfect for projection mapping, VR experiences, and architectural visualization.",
    type: "website",
    url: "https://www.n3uralia360.art",
  },
  twitter: {
    card: "summary_large_image",
    title: "N3urali.art - Premium 360° Digital Photography & AI-Generated Imagery",
    description:
      "Discover our curated collection of AI-generated equirectangular and fisheye images, perfect for projection mapping, VR experiences, and architectural visualization.",
  },
  alternates: {
    canonical: "https://www.n3uralia360.art",
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="mb-4 animate-pulse-glow">
              Premium Digital Photography
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-balance leading-tight">
              Immersive
              <span className="text-primary block">360° Imagery</span>
              for Professionals
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Discover our curated collection of equirectangular and fisheye images, perfect for projection mapping, VR
              experiences, and architectural visualization.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button size="lg" className="group glow-primary">
                <Link href="/gallery" className="flex items-center gap-2">
                  Explore Gallery
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button variant="outline" size="lg" className="group bg-transparent">
                <Link href="/about" className="flex items-center gap-2">
                  Learn More
                  <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Takeaways Section */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                Key Takeaways
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-balance">What Makes N3urali.art Different?</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">For Content Creators & Developers:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Get professional 360° images without expensive equipment</li>
                  <li>• Download high-resolution files (4K-16K) instantly after purchase</li>
                  <li>• Use for VR applications, projection mapping, and immersive experiences</li>
                  <li>• Choose flexible licensing options for your specific project needs</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">AI-Powered Quality:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Every image is AI-generated from scratch using proprietary tools</li>
                  <li>• Professional enhancement pipeline ensures supreme quality</li>
                  <li>• Unique scenes that don't exist anywhere else</li>
                  <li>• Equirectangular and fisheye formats for maximum compatibility</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Professional Quality,
              <span className="text-primary">Instant Access</span>
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              High-resolution images with flexible licensing options for your creative projects.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card
              className="group hover:glow-accent transition-all duration-300 animate-float"
              style={{ animationDelay: "0s" }}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <Eye className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">360° Previews</h3>
                <p className="text-muted-foreground">
                  Interactive previews let you explore every angle before purchase.
                </p>
              </CardContent>
            </Card>

            <Card
              className="group hover:glow-accent transition-all duration-300 animate-float"
              style={{ animationDelay: "0.5s" }}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <Download className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Instant Downloads</h3>
                <p className="text-muted-foreground">Get high-resolution files immediately after purchase. 4K-16K</p>
              </CardContent>
            </Card>

            <Card
              className="group hover:glow-accent transition-all duration-300 animate-float"
              style={{ animationDelay: "1s" }}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Flexible Licensing</h3>
                <p className="text-muted-foreground">Choose from exclusive or non-exclusive license options.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Generation and Enhancement Showcase Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Badge variant="secondary" className="mb-4 animate-pulse-glow">
              AI-Powered Excellence
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">
              Supreme Quality Through
              <span className="text-primary block">AI Generation & Enhancement</span>
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Experience the future of digital imagery with our cutting-edge AI generation and enhancement pipeline,
              delivering unprecedented quality and detail in every 360° image.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  </div>
                  <h3 className="text-xl font-semibold">AI-Generated Foundations</h3>
                </div>
                <p className="text-muted-foreground pl-11">
                  Every image begins with advanced AI generation, creating unique 360° environments with unprecedented
                  detail and artistic vision.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
                  </div>
                  <h3 className="text-xl font-semibold">Professional Enhancement</h3>
                </div>
                <p className="text-muted-foreground pl-11">
                  Our proprietary enhancement pipeline transforms raw AI output into professional-grade imagery with
                  superior clarity, color accuracy, and resolution.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
                  </div>
                  <h3 className="text-xl font-semibold">Built From Scratch</h3>
                </div>
                <p className="text-muted-foreground pl-11">
                  Every tool in our pipeline is custom-built, ensuring complete control over quality, performance, and
                  the final artistic vision.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl" />
              <Card className="relative bg-card/80 backdrop-blur-sm border-primary/20">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">4K - 16K</div>
                      <p className="text-sm text-muted-foreground">Resolution Range</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold mb-1">100%</div>
                        <p className="text-xs text-muted-foreground">AI Generated</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold mb-1">∞</div>
                        <p className="text-xs text-muted-foreground">Unique Scenes</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border/50">
                      <p className="text-sm text-muted-foreground text-center">
                        "Demonstrating that AI-generated material of supreme quality is not just possible, but the
                        future of digital imagery."
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-2 mb-4">
                <HelpCircle className="w-6 h-6 text-primary" />
                <Badge variant="secondary">Frequently Asked Questions</Badge>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
                Everything You Need to Know About
                <span className="text-primary block">360° Digital Photography</span>
              </h2>
              <p className="text-lg text-muted-foreground text-pretty">
                Common questions about our AI-generated imagery, licensing, and technical specifications.
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="what-is-360-photography" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  What is 360° photography and how is it different from regular photography?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  360° photography captures a complete spherical view of an environment, allowing viewers to look in any
                  direction. Unlike regular photography that captures a single perspective, 360° images provide an
                  immersive experience where you can explore the entire scene. Our AI-generated 360° images are created
                  in equirectangular and fisheye formats, making them perfect for VR applications, projection mapping,
                  and architectural visualization.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ai-generated-quality" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  How can AI-generated images match professional photography quality?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Our proprietary AI generation and enhancement pipeline creates images that often exceed traditional
                  photography quality. Every image is generated from scratch using custom-built tools, then enhanced
                  through professional post-processing. This approach allows us to create unique scenes with perfect
                  lighting, composition, and detail that would be impossible or extremely expensive to capture with
                  traditional methods. The result is supreme quality 4K-16K resolution imagery.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="licensing-options" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  What licensing options are available and which should I choose?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We offer both exclusive and non-exclusive licensing options. Non-exclusive licenses are perfect for
                  most commercial projects and allow multiple buyers to use the same image. Exclusive licenses give you
                  sole rights to use the image, making it ideal for brand campaigns or unique projects where exclusivity
                  is important. All licenses include commercial usage rights for projection mapping, VR experiences,
                  architectural visualization, and digital content creation.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="technical-specs" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  What technical specifications and formats do you provide?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  All images are available in high-resolution formats ranging from 4K to 16K resolution. We provide both
                  equirectangular (360° x 180°) and fisheye formats to ensure compatibility with various VR platforms,
                  projection systems, and software applications. Images are delivered in standard formats (JPEG, PNG)
                  with full metadata and are optimized for immediate use in professional workflows.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="use-cases" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left">What are the best use cases for 360° imagery?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  360° imagery is perfect for VR experiences, virtual tours, projection mapping installations,
                  architectural visualization, game development, immersive marketing campaigns, and educational content.
                  Content creators use our images for YouTube 360° videos, social media campaigns, and interactive
                  presentations. Developers integrate them into VR applications, games, and simulation software. The
                  immersive nature makes them ideal for any project requiring environmental storytelling or spatial
                  presence.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="download-process" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  How does the download and purchase process work?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Browse our gallery with interactive 360° previews, select your desired images, choose your licensing
                  option, and complete the purchase. Downloads are available immediately after payment confirmation.
                  You'll receive high-resolution files along with licensing documentation and technical specifications.
                  All purchases include lifetime access to re-download your files, and we provide customer support for
                  any technical questions about implementation.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-balance">
              Ready to Transform Your
              <span className="text-primary block">Creative Vision?</span>
            </h2>

            <p className="text-xl text-muted-foreground text-pretty">
              Join thousands of professionals who trust N3urali.art for premium 360° digital photography and immersive
              imagery solutions.
            </p>

            <Button size="lg" className="glow-primary">
              <Link href="/gallery" className="flex items-center gap-2">
                Start Exploring
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
