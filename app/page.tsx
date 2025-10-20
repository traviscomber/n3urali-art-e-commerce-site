import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, HelpCircle, Sparkles, Grid3x3, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import LandingGalleryTabs from "@/components/landing-gallery-tabs"

export const metadata: Metadata = {
  title: "n3uralia360.art - Premium 360° Imagery",
  description:
    "Curated collection of premium 360° dome and equirectangular images for VR, projection mapping, and visualization.",
}

export const revalidate = 300

export default async function HomePage() {
  const supabase = await createClient()

  const { data: imageOfTheDay } = await supabase
    .from("images")
    .select("id, title, file_path, original_url, upscaled_url, price, image_format")
    .eq("featured_collection", true)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  const { data: collectionImages } = await supabase
    .from("images")
    .select("id, title, file_path, original_url, upscaled_url, price, image_format")
    .eq("featured_collection", true)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-background">
      {imageOfTheDay && (
        <section className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />

          <div className="relative container mx-auto px-4">
            <div className="max-w-7xl mx-auto space-y-12">
              {/* Site Title and Badge */}
              <div className="text-center space-y-6">
                <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20 text-sm px-4 py-2">
                  Image of the Day
                </Badge>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
                  Premium 360°
                  <span className="block text-primary mt-2">Imagery</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                  Experience the quality and detail of our professional AI-generated imagery
                </p>
              </div>

              {/* Featured Image with Watermark */}
              <div className="relative group">
                <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
                  <Image
                    src={
                      imageOfTheDay.upscaled_url ||
                      imageOfTheDay.original_url ||
                      imageOfTheDay.file_path ||
                      "/placeholder.svg" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt={imageOfTheDay.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1400px) 100vw, 1400px"
                    priority
                  />

                  {/* Watermark Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-white/20 text-6xl md:text-8xl lg:text-9xl font-bold tracking-wider transform -rotate-12 select-none">
                      N3URALIA360.ART
                    </div>
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Image Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <div className="flex items-end justify-between gap-4 flex-wrap">
                      <div className="space-y-2">
                        <h2 className="text-2xl md:text-3xl font-bold">{imageOfTheDay.title}</h2>
                        <div className="flex items-center gap-3 text-sm">
                          <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                            {imageOfTheDay.image_format}
                          </Badge>
                          <span className="text-white/80">Ultra High Resolution</span>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-3xl font-bold">${imageOfTheDay.price}</div>
                        <Link href={`/product/${imageOfTheDay.id}`}>
                          <Button size="lg" className="bg-primary hover:bg-primary/90">
                            View Details
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              </div>
            </div>
          </div>
        </section>
      )}

      {collectionImages && collectionImages.length > 0 && (
        <section className="py-16 bg-background overflow-hidden">
          <div className="container mx-auto px-4 mb-8">
            <div className="text-center space-y-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Premium Collection
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold">
                20 Curated <span className="text-primary">360° Images</span>
              </h2>
            </div>
          </div>

          <div className="relative">
            {/* Gradient Overlays for fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            {/* Infinite Scroll Container */}
            <div className="flex gap-6 animate-infinite-scroll hover:pause-animation">
              {/* First set of images */}
              {collectionImages.map((image) => (
                <Link
                  key={`first-${image.id}`}
                  href={`/product/${image.id}`}
                  className="group flex-shrink-0 w-80 h-52 relative rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                >
                  <Image
                    src={image.upscaled_url || image.original_url || image.file_path || "/placeholder.svg"}
                    alt={image.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="320px"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-semibold text-sm line-clamp-1 mb-1">{image.title}</h3>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                        {image.image_format}
                      </Badge>
                      <span className="text-lg font-bold">${image.price}</span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Duplicate set for seamless loop */}
              {collectionImages.map((image) => (
                <Link
                  key={`second-${image.id}`}
                  href={`/product/${image.id}`}
                  className="group flex-shrink-0 w-80 h-52 relative rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                >
                  <Image
                    src={image.upscaled_url || image.original_url || image.file_path || "/placeholder.svg"}
                    alt={image.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="320px"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-semibold text-sm line-clamp-1 mb-1">{image.title}</h3>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                        {image.image_format}
                      </Badge>
                      <span className="text-lg font-bold">${image.price}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* View All Button */}
          <div className="text-center mt-8">
            <Link href="/collection">
              <Button size="lg" variant="outline" className="group bg-transparent">
                View Complete Collection
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Main CTAs - 3 Large Cards */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Collection Card */}
            <Link href="/collection" className="group">
              <Card className="h-full hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <CardContent className="p-8 space-y-6 h-full flex flex-col">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>

                  <div className="flex-1 space-y-3">
                    <h2 className="text-3xl font-bold">Collection</h2>
                    <p className="text-muted-foreground text-lg">20 curated premium images</p>
                    <div className="pt-2">
                      <div className="text-4xl font-bold text-primary">$999</div>
                      <div className="text-sm text-muted-foreground">Complete bundle</div>
                    </div>
                  </div>

                  <Button
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    size="lg"
                  >
                    View Collection
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Gallery Card */}
            <Link href="/gallery" className="group">
              <Card className="h-full hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <CardContent className="p-8 space-y-6 h-full flex flex-col">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Grid3x3 className="w-8 h-8 text-primary" />
                  </div>

                  <div className="flex-1 space-y-3">
                    <h2 className="text-3xl font-bold">Gallery</h2>
                    <p className="text-muted-foreground text-lg">Browse all individual images</p>
                    <div className="pt-2">
                      <div className="text-4xl font-bold">130+</div>
                      <div className="text-sm text-muted-foreground">Premium images</div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors bg-transparent"
                    size="lg"
                  >
                    Browse Gallery
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Sign In Card */}
            <Link href="/auth/login" className="group">
              <Card className="h-full hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <CardContent className="p-8 space-y-6 h-full flex flex-col">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <User className="w-8 h-8 text-primary" />
                  </div>

                  <div className="flex-1 space-y-3">
                    <h2 className="text-3xl font-bold">Sign In</h2>
                    <p className="text-muted-foreground text-lg">Access your account and orders</p>
                    <div className="pt-2">
                      <div className="text-lg font-semibold">Instant</div>
                      <div className="text-sm text-muted-foreground">Download access</div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors bg-transparent"
                    size="lg"
                  >
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div className="space-y-3">
                <div className="text-4xl font-bold text-primary">4K-16K</div>
                <p className="text-muted-foreground">Ultra high resolution</p>
              </div>
              <div className="space-y-3">
                <div className="text-4xl font-bold text-primary">Instant</div>
                <p className="text-muted-foreground">Download after purchase</p>
              </div>
              <div className="space-y-3">
                <div className="text-4xl font-bold text-primary">VR Ready</div>
                <p className="text-muted-foreground">Perfect for immersive experiences</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Gallery Section with Tabs */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4 animate-pulse-glow">
                Featured Gallery
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
                Explore Our
                <span className="text-primary block">Premium 360° Collection</span>
              </h2>
              <p className="text-lg text-muted-foreground text-pretty">
                Browse our curated selection of dome, equirectangular, and featured collection images
              </p>
            </div>

            <LandingGalleryTabs />
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

            <div className="space-y-8">
              <div className="bg-card rounded-lg px-6 py-8 space-y-4">
                <h3 className="text-xl font-semibold">
                  What is 360° photography and how is it different from regular photography?
                </h3>
                <p className="text-muted-foreground">
                  360° photography captures a complete spherical view of an environment, allowing viewers to look in any
                  direction. Unlike regular photography that captures a single perspective, 360° images provide an
                  immersive experience where you can explore the entire scene. Our AI-generated 360° images are created
                  in equirectangular and fisheye formats, making them perfect for VR applications, projection mapping,
                  and architectural visualization.
                </p>
              </div>

              <div className="bg-card rounded-lg px-6 py-8 space-y-4">
                <h3 className="text-xl font-semibold">
                  How can AI-generated images match professional photography quality?
                </h3>
                <p className="text-muted-foreground">
                  Our proprietary AI generation and enhancement pipeline creates images that often exceed traditional
                  photography quality. Every image is generated from scratch using custom-built tools, then enhanced
                  through professional post-processing. This approach allows us to create unique scenes with perfect
                  lighting, composition, and detail that would be impossible or extremely expensive to capture with
                  traditional methods. The result is supreme quality 4K-16K resolution imagery.
                </p>
              </div>

              <div className="bg-card rounded-lg px-6 py-8 space-y-4">
                <h3 className="text-xl font-semibold">
                  What licensing options are available and which should I choose?
                </h3>
                <p className="text-muted-foreground">
                  We offer both exclusive and non-exclusive licensing options. Non-exclusive licenses are perfect for
                  most commercial projects and allow multiple buyers to use the same image. Exclusive licenses give you
                  sole rights to use the image, making it ideal for brand campaigns or unique projects where exclusivity
                  is important. All licenses include commercial usage rights for projection mapping, VR experiences,
                  architectural visualization, and digital content creation.
                </p>
              </div>

              <div className="bg-card rounded-lg px-6 py-8 space-y-4">
                <h3 className="text-xl font-semibold">What technical specifications and formats do you provide?</h3>
                <p className="text-muted-foreground">
                  All images are available in high-resolution formats ranging from 4K to 16K resolution. We provide both
                  equirectangular (360° x 180°) and fisheye formats to ensure compatibility with various VR platforms,
                  projection systems, and software applications. Images are delivered in standard formats (JPEG, PNG)
                  with full metadata and are optimized for immediate use in professional workflows.
                </p>
              </div>

              <div className="bg-card rounded-lg px-6 py-8 space-y-4">
                <h3 className="text-xl font-semibold">What are the best use cases for 360° imagery?</h3>
                <p className="text-muted-foreground">
                  360° imagery is perfect for VR experiences, virtual tours, projection mapping installations,
                  architectural visualization, game development, immersive marketing campaigns, and educational content.
                  Content creators use our images for YouTube 360° videos, social media campaigns, and interactive
                  presentations. Developers integrate them into VR applications, games, and simulation software. The
                  immersive nature makes them ideal for any project requiring environmental storytelling or spatial
                  presence.
                </p>
              </div>

              <div className="bg-card rounded-lg px-6 py-8 space-y-4">
                <h3 className="text-xl font-semibold">How does the download and purchase process work?</h3>
                <p className="text-muted-foreground">
                  Browse our gallery with interactive 360° previews, select your desired images, choose your licensing
                  option, and complete the purchase. Downloads are available immediately after payment confirmation.
                  You'll receive high-resolution files along with licensing documentation and technical specifications.
                  All purchases include lifetime access to re-download your files, and we provide customer support for
                  any technical questions about implementation.
                </p>
              </div>
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
              Join thousands of professionals who trust n3uralia360.art and the n3uralia group for premium 360° digital
              photography and immersive imagery solutions.
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
