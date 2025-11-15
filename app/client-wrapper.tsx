"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, HelpCircle, Sparkles, Grid3x3, User } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import LandingGalleryTabs from "@/components/landing-gallery-tabs"
import AuctionCarousel from "@/components/auction-carousel"
import { useLanguage } from "@/lib/contexts/language-context"
import { useState, useEffect } from "react"

interface FeaturedImage {
  id: string
  title: string
  file_path: string
  original_url: string | null
  upscaled_url: string | null
  price: number
  image_format: string
  thumbnail_small_url?: string
  thumbnail_medium_url?: string
  thumbnail_large_url?: string
}

interface ClientWrapperProps {
  imageOfTheDay: FeaturedImage | null
  collectionImages: FeaturedImage[]
  auctionImages: FeaturedImage[]
  dailyImages: FeaturedImage[]
}

export function ClientWrapper({ imageOfTheDay, collectionImages, auctionImages, dailyImages }: ClientWrapperProps) {
  const { t } = useLanguage()
  const [auctionTimeLeft, setAuctionTimeLeft] = useState({ minutes: 0, seconds: 0 })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const secondsLeft = 59 - now.getSeconds()
      // Always show 0 minutes since we're only counting 60 seconds
      return { minutes: 0, seconds: secondsLeft }
    }

    setAuctionTimeLeft(calculateTimeLeft())
    const interval = setInterval(() => {
      setAuctionTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video background placeholder - fullscreen behind content */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
          
          {/* Video placeholder element */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/20">
            <div className="text-center space-y-4 p-8 opacity-30">
              <div className="text-6xl">🎬</div>
              <p className="text-2xl font-semibold text-muted-foreground">{t("hero.videoPlaceholder")}</p>
              <p className="text-sm text-muted-foreground/70">Video demostrativo próximamente</p>
            </div>
          </div>

          {/* If imageOfTheDay exists, show it as background fallback */}
          {imageOfTheDay && (
            <Image
              src={
                imageOfTheDay.upscaled_url ||
                imageOfTheDay.original_url ||
                imageOfTheDay.file_path ||
                "/placeholder.svg"
               || "/placeholder.svg"}
              alt={imageOfTheDay.title}
              fill
              className="object-cover opacity-40"
              sizes="100vw"
              priority
            />
          )}
        </div>

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] z-[1]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
        </div>

        <div className="relative container mx-auto px-4 py-20 z-10">
          <div className="max-w-7xl mx-auto">
            {/* Hero content */}
            <div className="text-center space-y-10 mb-20">
              {/* Subtle badge */}
              <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-5 py-2.5 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">{t("hero.badge")}</span>
              </div>

              {/* Main headline - elegant and bold */}
              <h1 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight leading-[0.95] text-balance text-white drop-shadow-2xl">
                {t("hero.title")}
                <br />
                <span className="text-primary">{t("hero.subtitle")}</span>
              </h1>

              {/* Description - focus on art and uniqueness */}
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed text-pretty font-light drop-shadow-lg">
                {t("hero.description")}
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <Link href="/gallery">
                  <Button size="lg" className="text-lg px-10 py-7 h-auto shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all">
                    {t("hero.cta.explore")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="#featured">
                  <Button size="lg" variant="outline" className="text-lg px-10 py-7 h-auto bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/20 hover:border-white/40">
                    {t("hero.cta.demo")}
                  </Button>
                </Link>
              </div>

              {/* Technical indicators - minimal and elegant */}
              <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-white/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  <span className="font-medium">4K – 16K</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  <span className="font-medium">VR Ready</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  <span className="font-medium">{t("stats.instant")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
          <div className="flex flex-col items-center gap-2 text-white/60 animate-bounce">
            <div className="w-6 h-10 border-2 border-current rounded-full flex items-start justify-center p-2">
              <div className="w-1 h-2 bg-current rounded-full animate-scroll" />
            </div>
          </div>
        </div>
      </section>
      {/* End of refined hero section */}

      {imageOfTheDay && (
        <section className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />

          <div className="relative container mx-auto px-4">
            <div className="max-w-7xl mx-auto space-y-12">
              <div className="text-center space-y-6">
                <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20 text-sm px-4 py-2">
                  {t("hero.imageOfDay")}
                </Badge>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
                  {t("hero.title")} <span className="text-primary">{t("hero.titleHighlight")}</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                  {t("hero.subtitle")}
                </p>
              </div>

              <div className="relative group">
                <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
                  <Image
                    src={
                      imageOfTheDay.upscaled_url ||
                      imageOfTheDay.original_url ||
                      imageOfTheDay.file_path ||
                      "/placeholder.svg"
                     || "/placeholder.svg"}
                    alt={imageOfTheDay.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1400px) 100vw, 1400px"
                    priority
                  />

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-white/20 text-6xl md:text-8xl lg:text-9xl font-bold tracking-wider transform -rotate-12 select-none">
                      N3URALIA360.ART
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-end justify-between gap-4 flex-wrap">
                      <div className="space-y-2">
                        <h2 className="text-2xl md:text-3xl font-bold">{imageOfTheDay.title}</h2>
                        <div className="flex items-center gap-3 text-sm">
                          <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                            {imageOfTheDay.image_format}
                          </Badge>
                          <span className="text-white/80">{t("stats.resolutionNote")}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge className="bg-gradient-to-r from-yellow-400/40 to-orange-500/40 text-black font-bold text-lg px-4 py-2 border-0 animate-pulse">
                          20{t("hero.offToday")}
                        </Badge>
                        <Link href={`/photo/${imageOfTheDay.id}`}>
                          <Button size="lg" className="bg-primary hover:bg-primary/90 w-full mt-2">
                            {t("hero.viewDetails")}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                  {/* End of change */}
                </div>

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
                {t("collection.badge")}
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold">
                {t("collection.title")} <span className="text-primary">{t("collection.titleHighlight")}</span>
              </h2>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            <div className="flex gap-6 animate-infinite-scroll hover:pause-animation">
              {collectionImages.map((image) => (
                <Link
                  key={`first-${image.id}`}
                  href={`/photo/${image.id}`}
                  className="group flex-shrink-0 w-[500px] h-80 relative rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                >
                  <Image
                    src={image.upscaled_url || image.original_url || image.file_path || "/placeholder.svg"}
                    alt={image.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="500px"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2">{image.title}</h3>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                        {image.image_format}
                      </Badge>
                      <Badge className="bg-gradient-to-r from-yellow-400/40 to-orange-500/40 text-black text-xs font-bold border-0">
                        15{t("collection.off")}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}

              {collectionImages.map((image) => (
                <Link
                  key={`second-${image.id}`}
                  href={`/photo/${image.id}`}
                  className="group flex-shrink-0 w-[500px] h-80 relative rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                >
                  <Image
                    src={image.upscaled_url || image.original_url || image.file_path || "/placeholder.svg"}
                    alt={image.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="500px"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2">{image.title}</h3>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                        {image.image_format}
                      </Badge>
                      <Badge className="bg-gradient-to-r from-yellow-400/40 to-orange-500/40 text-black text-xs font-bold border-0">
                        15{t("collection.off")}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/collection">
              <Button size="lg" variant="outline" className="group bg-transparent">
                {t("collection.viewComplete")}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {auctionImages && auctionImages.length > 0 && (
        <section className="py-24 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-orange-500/5 to-yellow-500/5 pointer-events-none" />

          <div className="container mx-auto px-4 relative">
            <div className="max-w-5xl mx-auto">
              <div className="text-center space-y-8 mb-16">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                    {t("auction.title")} <span className="text-primary">{t("auction.titleHighlight")}</span>
                  </h2>

                  <div className="flex justify-center mt-8">
                    <div className="text-center">
                      <div
                        className="text-6xl md:text-7xl lg:text-8xl font-thin tabular-nums"
                        style={{ color: "#392A48" }}
                      >
                        {auctionTimeLeft.seconds.toString().padStart(2, "0")}
                      </div>
                      <div
                        className="text-xs md:text-sm uppercase tracking-widest font-light mt-2"
                        style={{ color: "#392A48" }}
                      >
                        {t("seconds")}
                      </div>
                      <div className="text-sm text-muted-foreground mt-3">
                        {t("untilPricesReset")}
                      </div>
                    </div>
                  </div>

                  <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-6">
                    {t("auction.subtitle")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <AuctionCarousel images={auctionImages} />
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground bg-muted/50 inline-block px-6 py-3 rounded-full backdrop-blur-sm border border-border/50">
              {t("auction.tip")}
            </p>
          </div>
        </section>
      )}

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Link href="/collection" className="group">
              <Card className="h-full hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <CardContent className="p-8 space-y-6 h-full flex flex-col">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>

                  <div className="flex-1 space-y-3">
                    <h2 className="text-3xl font-bold">{t("cta.collection.title")}</h2>
                    <p className="text-muted-foreground text-lg">{t("cta.collection.subtitle")}</p>
                    <div className="pt-2">
                      <div className="text-4xl font-bold text-primary">{t("cta.collection.price")}</div>
                      <div className="text-sm text-muted-foreground">{t("cta.collection.priceNote")}</div>
                    </div>
                  </div>

                  <Button
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    size="lg"
                  >
                    {t("cta.collection.button")}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/gallery" className="group">
              <Card className="h-full hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <CardContent className="p-8 space-y-6 h-full flex flex-col">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Grid3x3 className="w-8 h-8 text-primary" />
                  </div>

                  <div className="flex-1 space-y-3">
                    <h2 className="text-3xl font-bold">{t("cta.gallery.title")}</h2>
                    <p className="text-muted-foreground text-lg">{t("cta.gallery.subtitle")}</p>
                    <div className="pt-2">
                      <div className="text-4xl font-bold">{t("cta.gallery.count")}</div>
                      <div className="text-sm text-muted-foreground">{t("cta.gallery.countNote")}</div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors bg-transparent"
                    size="lg"
                  >
                    {t("cta.gallery.button")}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/auth/login" className="group">
              <Card className="h-full hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <CardContent className="p-8 space-y-6 h-full flex flex-col">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <User className="w-8 h-8 text-primary" />
                  </div>

                  <div className="flex-1 space-y-3">
                    <h2 className="text-3xl font-bold">{t("cta.signIn.title")}</h2>
                    <p className="text-muted-foreground text-lg">{t("cta.signIn.subtitle")}</p>
                    <div className="pt-2">
                      <div className="text-lg font-semibold">{t("cta.signIn.access")}</div>
                      <div className="text-sm text-muted-foreground">{t("cta.signIn.accessNote")}</div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors bg-transparent"
                    size="lg"
                  >
                    {t("cta.signIn.button")}
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
                <div className="text-4xl font-bold text-primary">{t("stats.resolution")}</div>
                <p className="text-muted-foreground">{t("stats.resolutionNote")}</p>
              </div>
              <div className="space-y-3">
                <div className="text-4xl font-bold">{t("stats.instant")}</div>
                <p className="text-muted-foreground">{t("stats.instantNote")}</p>
              </div>
              <div className="space-y-3">
                <div className="text-4xl font-bold text-primary">{t("stats.vr")}</div>
                <p className="text-muted-foreground">{t("stats.vrNote")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4 animate-pulse-glow">
                {t("featured.badge")}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
                {t("featured.title")} <span className="text-primary">{t("featured.titleHighlight")}</span>
              </h2>
              <p className="text-lg text-muted-foreground text-pretty">{t("featured.subtitle")}</p>
            </div>

            <LandingGalleryTabs dailyImages={dailyImages} />
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-2 mb-4">
                <HelpCircle className="w-6 h-6 text-primary" />
                <Badge variant="secondary">{t("faq.badge")}</Badge>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
                {t("faq.title")} <span className="text-primary">{t("faq.titleHighlight")}</span>
              </h2>
              <p className="text-lg text-muted-foreground text-pretty">{t("faq.subtitle")}</p>
            </div>

            <div className="space-y-8">
              <div className="bg-card rounded-lg px-6 py-8 space-y-4">
                <h3 className="text-xl font-semibold">{t("faq.q1.title")}</h3>
                <p className="text-muted-foreground whitespace-pre-line">{t("faq.q1.answer")}</p>
              </div>

              <div className="bg-card rounded-lg px-6 py-8 space-y-4">
                <h3 className="text-xl font-semibold">{t("faq.q2.title")}</h3>
                <p className="text-muted-foreground whitespace-pre-line">{t("faq.q2.answer")}</p>
              </div>

              <div className="bg-card rounded-lg px-6 py-8 space-y-4">
                <h3 className="text-xl font-semibold">{t("faq.q3.title")}</h3>
                <p className="text-muted-foreground whitespace-pre-line">{t("faq.q3.answer")}</p>
              </div>

              <div className="bg-card rounded-lg px-6 py-8 space-y-4">
                <h3 className="text-xl font-semibold">{t("faq.q4.title")}</h3>
                <p className="text-muted-foreground whitespace-pre-line">{t("faq.q4.answer")}</p>
              </div>

              <div className="bg-card rounded-lg px-6 py-8 space-y-4">
                <h3 className="text-xl font-semibold">{t("faq.q5.title")}</h3>
                <p className="text-muted-foreground whitespace-pre-line">{t("faq.q5.answer")}</p>
              </div>

              <div className="bg-card rounded-lg px-6 py-8 space-y-4">
                <h3 className="text-xl font-semibold">{t("faq.q6.title")}</h3>
                <p className="text-muted-foreground whitespace-pre-line">{t("faq.q6.answer")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-balance">
              {t("cta.readyToTransform")}
              <span className="text-primary block">{t("cta.creativeVision")}</span>
            </h2>

            <p className="text-xl text-muted-foreground text-pretty">{t("cta.joinThousands")}</p>

            <Button size="lg" className="glow-primary">
              <Link href="/gallery" className="flex items-center gap-2">
                {t("cta.startExploring")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
