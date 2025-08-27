import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Eye, Download, Shield } from "lucide-react"
import Link from "next/link"

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
                <p className="text-muted-foreground">Get high-resolution files immediately after purchase.</p>
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
                <p className="text-muted-foreground">Choose from standard, extended, or commercial licenses.</p>
              </CardContent>
            </Card>
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
