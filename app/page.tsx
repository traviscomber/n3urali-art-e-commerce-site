import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Eye, Download, Shield } from "lucide-react"
import Link from "next/link"

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
  ],
  openGraph: {
    title: "N3urali.art - Premium 360° Digital Photography & AI-Generated Imagery",
    description:
      "Discover our curated collection of AI-generated equirectangular and fisheye images, perfect for projection mapping, VR experiences, and architectural visualization.",
    type: "website",
    url: "https://n3uralia360.art",
  },
  twitter: {
    card: "summary_large_image",
    title: "N3urali.art - Premium 360° Digital Photography & AI-Generated Imagery",
    description:
      "Discover our curated collection of AI-generated equirectangular and fisheye images, perfect for projection mapping, VR experiences, and architectural visualization.",
  },
  alternates: {
    canonical: "https://n3uralia360.art",
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
              Join thousands of professionals who trust n3urali.art for their immersive imagery needs.
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
