"use client"

import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Grid3x3, ChevronLeft, ChevronRight } from "lucide-react"
import AuctionCarousel from "@/components/auction-carousel"
import { useLanguage } from "@/lib/contexts/language-context"
import { ParticleTitle } from "@/components/particle-title"
import { AnimatedCountdown } from "@/components/animated-countdown"
import { Footer } from "@/components/footer"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, A11y } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

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
  description?: string
}

interface ClientWrapperProps {
  imageOfTheDay: FeaturedImage | null
  collectionImages: FeaturedImage[]
  auctionImages: FeaturedImage[]
  dailyImages: FeaturedImage[]
}

export const ClientWrapper = memo(
  function ClientWrapper({ imageOfTheDay, auctionImages, collectionImages, dailyImages }: ClientWrapperProps) {
    console.log("[v0] ClientWrapper render started")
    const { t } = useLanguage()
    const [auctionTimeLeft, setAuctionTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
    const swiperRef = useRef<SwiperType | null>(null)
    const isMounted = useRef(true)

    const calculateTimeLeft = useCallback(() => {
      const now = new Date()
      const secondsLeft = 59 - now.getSeconds()
      return { hours: 0, minutes: 0, seconds: secondsLeft }
    }, [])

    useEffect(() => {
      isMounted.current = true
      setAuctionTimeLeft(calculateTimeLeft())

      let animationFrameId: number
      let lastUpdate = Date.now()

      const updateTimer = () => {
        const now = Date.now()
        if (now - lastUpdate >= 1000 && isMounted.current) {
          setAuctionTimeLeft(calculateTimeLeft())
          lastUpdate = now
        }
        animationFrameId = requestAnimationFrame(updateTimer)
      }

      animationFrameId = requestAnimationFrame(updateTimer)

      return () => {
        isMounted.current = false
        cancelAnimationFrame(animationFrameId)
      }
    }, [calculateTimeLeft])

    const imageCounts = useMemo(
      () => ({
        auction: auctionImages?.length || 0,
        collection: collectionImages?.length || 0,
        daily: dailyImages?.length || 0,
      }),
      [auctionImages?.length, collectionImages?.length, dailyImages?.length],
    )

    return (
      <div className="min-h-screen bg-background">
        <main>
          {/* Hero Section */}
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectFit: "cover" }}
              >
                <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WebBackdrop360-ZzzGJhNrvLJpQ71ipTgLfyRV3xYdB4.mov" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
            </div>

            <div className="absolute inset-0 opacity-[0.03] z-[1]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
            </div>

            <div className="relative container mx-auto px-4 py-20 z-10">
              <div className="max-w-7xl mx-auto">
                <div className="text-center space-y-10 mb-20">
                  {/* <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-5 py-2.5 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">{t("hero.badge")}</span>
                </div> */}

                  <h1 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight leading-[0.95] text-balance text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
                    {t("hero.title")}
                    <br />
                    <span className="text-primary drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
                      {t("hero.titleHighlight")}
                    </span>
                  </h1>

                  <p className="text-xl md:text-2xl text-white max-w-4xl mx-auto leading-relaxed text-pretty font-light drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
                    {t("hero.subtitle")}
                    <span className="block mt-2 text-lg text-white/80 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
                      {t("hero.description")}
                    </span>
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                      <span className="font-medium">
                        {t("comparison.ourPro5").split(" ")[0]} {t("comparison.ourPro5").split(" ")[1]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                      <span className="font-medium">
                        {t("gallery.stats.resolution")} {t("stats.resolutionNote")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                      <span className="font-medium">{t("stats.instantNote")}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                      <span className="font-medium">{t("stats.vrNote")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
              <div className="flex flex-col items-center gap-2 text-muted-foreground animate-bounce">
                <div className="w-6 h-10 border-2 border-current rounded-full flex items-start justify-center p-2">
                  <div className="w-1 h-2 bg-current rounded-full animate-scroll" />
                </div>
              </div>
            </div>
          </section>

          {imageOfTheDay && (
            <section className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />

              <div className="relative container mx-auto px-4">
                <div className="max-w-7xl mx-auto space-y-12">
                  <div className="text-center space-y-6">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
                      {t("cta.readyToTransform")} <span className="text-primary">{t("cta.creativeVision")}</span>
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
                          "/placeholder.svg" ||
                          "/placeholder.svg"
                        }
                        alt={imageOfTheDay.title}
                        fill
                        className="object-cover animate-kenBurnsAuction"
                        sizes="(max-width: 1400px) 100vw, 1400px"
                        priority
                      />

                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-foreground/10 text-6xl md:text-8xl lg:text-9xl font-bold tracking-wider transform -rotate-12 select-none">
                          n3uralia360.art
                        </div>
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="absolute bottom-0 left-0 right-0 p-8 text-foreground md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-end justify-between gap-4 flex-wrap">
                          <div className="space-y-2">
                            <h2 className="text-2xl md:text-3xl font-bold">{imageOfTheDay.title}</h2>
                            <div className="flex items-center gap-3 text-sm">
                              {/* <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                              {imageOfTheDay.image_format}
                            </Badge> */}
                              <span className="text-muted-foreground">{t("stats.resolutionNote")}</span>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            {/* <Badge className="bg-gradient-to-r from-yellow-400/40 to-orange-500/40 text-black font-bold text-lg px-4 py-2 border-0 animate-pulse">
                            20{t("hero.offToday")}
                          </Badge> */}
                            <Link href={`/photo/${imageOfTheDay.id}`}>
                              <Button size="lg" className="bg-primary hover:bg-primary/90 w-full mt-2">
                                {t("hero.viewDetails")}
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Collections Carousel with Navigation Arrows */}
          {collectionImages.length > 0 && (
            <section className="py-16 bg-background overflow-hidden">
              <div className="container mx-auto px-4 mb-8">
                <div className="text-center space-y-3">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    {t("collection.title")} <span className="text-primary">{t("collection.titleHighlight")}</span>
                  </h2>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => swiperRef.current?.slidePrev()}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110 shadow-lg"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={() => swiperRef.current?.slideNext()}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110 shadow-lg"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

                <Swiper
                  modules={[Navigation, A11y]}
                  spaceBetween={24}
                  slidesPerView="auto"
                  loop={true}
                  speed={800}
                  onSwiper={(swiper) => {
                    swiperRef.current = swiper
                  }}
                  className="!overflow-visible"
                >
                  {collectionImages.map((image) => (
                    <SwiperSlide key={image.id} className="!w-[500px]">
                      <Link
                        href={`/photo/${image.id}`}
                        className="group block relative rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                      >
                        <div className="relative h-80">
                          <Image
                            src={image.upscaled_url || image.original_url || image.file_path || "/placeholder.svg"}
                            alt={image.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="500px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6 text-foreground space-y-2">
                          <h3 className="font-bold text-xl line-clamp-1">{image.title}</h3>
                          {image.description && (
                            <p className="text-sm text-foreground/80 line-clamp-2 leading-relaxed">
                              {image.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-sm text-muted-foreground">{image.image_format}</span>
                            <span
                              className="text-lg font-bold"
                              style={{
                                color: "#7851A9",
                                textShadow: "0 0 8px rgba(0, 0, 0, 0.8), 0 0 12px rgba(0, 0, 0, 0.6)",
                              }}
                            >
                              ${Number.parseFloat(image.price || "0").toFixed(0)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              <div className="text-center mt-8">
                <Link href="/collection">
                  <Button
                    size="lg"
                    variant="outline"
                    className="group bg-transparent text-foreground border-foreground/20 hover:bg-foreground/10 hover:text-foreground hover:border-foreground/40"
                  >
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
                      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                        {t("auction.title")}{" "}
                        <span className="text-primary drop-shadow-[0_0_20px_rgba(139,92,246,0.8)]">
                          {t("auction.titleHighlight")}
                        </span>
                      </h2>

                      <div className="flex justify-center mt-8">
                        <AnimatedCountdown seconds={auctionTimeLeft.seconds} label={t("seconds")} />
                      </div>

                      <div className="text-sm text-muted-foreground mt-6">{t("untilPricesReset")}</div>

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

          <section className="py-24 bg-gradient-to-b from-muted/10 via-background to-background">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                  <h2 className="text-4xl md:text-5xl font-bold text-balance">
                    {t("comparison.title")}
                    <span className="text-primary block mt-1">{t("comparison.titleHighlight")}</span>
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
                    {t("comparison.ourPlatformNote")}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  <Card className="p-6 space-y-4 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20 bg-card">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">✓</span>
                    </div>
                    <h3 className="text-lg font-bold">{t("comparison.ourPro1")}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Skip the AI generation hassle. Get production-ready 360° images instantly.
                    </p>
                  </Card>

                  <Card className="p-6 space-y-4 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20 bg-card">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">✓</span>
                    </div>
                    <h3 className="text-lg font-bold">{t("comparison.ourPro2")}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Equirectangular for VR, Dome for planetariums - all formats included.
                    </p>
                  </Card>

                  <Card className="p-6 space-y-4 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20 bg-card">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">✓</span>
                    </div>
                    <h3 className="text-lg font-bold">{t("comparison.ourPro3")}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Professional 4K+ resolution perfect for any project scale.
                    </p>
                  </Card>

                  <Card className="p-6 space-y-4 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20 bg-card">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">✓</span>
                    </div>
                    <h3 className="text-lg font-bold">{t("comparison.ourPro4")}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Curated collections designed by professionals, not random AI outputs.
                    </p>
                  </Card>

                  <Card className="p-6 space-y-4 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20 bg-card">
                    <div className="w-12 h-12 bg-primary/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">✓</span>
                    </div>
                    <h3 className="text-lg font-bold">{t("comparison.ourPro5")}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Use in games, films, VR experiences - full commercial rights included.
                    </p>
                  </Card>

                  <Card className="p-6 space-y-4 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20 bg-card">
                    <div className="w-12 h-12 bg-primary/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <h3 className="text-lg font-bold">Instant Download</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      No waiting, no processing. Download and use immediately in your workflow.
                    </p>
                  </Card>
                </div>

                <div className="mt-8 p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 rounded-2xl border-2 border-primary/30">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🛡️</span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">{t("comparison.legalTitle")}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{t("comparison.legalDesc")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <Image
                src="/placeholder.svg?height=600&width=1920"
                alt="Immersive 360° Experience"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-32 text-center">
              <div className="max-w-4xl mx-auto space-y-8">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] text-balance leading-tight">
                  Elevate Your
                  <span className="text-primary block mt-2">Creative Projects</span>
                </h2>

                <p className="text-xl md:text-2xl text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] max-w-2xl mx-auto text-pretty font-medium">
                  Transform your vision with premium 360° panoramic environments. Ready to use, commercially licensed,
                  instantly downloadable.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-6 pt-8">
                  <Link href="/collection">
                    <Button
                      size="lg"
                      className="text-xl md:text-2xl px-10 md:px-14 py-8 md:py-10 h-auto font-black shadow-2xl shadow-primary/70 hover:shadow-[0_0_80px_rgba(139,92,246,0.9)] transition-all duration-500 hover:scale-110 bg-primary hover:bg-primary/90"
                    >
                      Browse Collections
                      <ArrowRight className="w-7 h-7 ml-2" />
                    </Button>
                  </Link>

                  <Link href="/gallery">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-xl md:text-2xl px-10 md:px-14 py-8 md:py-10 h-auto font-black shadow-2xl bg-white/10 backdrop-blur-md border-2 border-white/50 text-white hover:bg-white/20 hover:border-white transition-all duration-500 hover:scale-110"
                    >
                      Explore Gallery
                      <ArrowRight className="w-7 h-7 ml-2" />
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-8 pt-12">
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
                      132+
                    </div>
                    <div className="text-sm md:text-base text-white/90 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] mt-1">
                      Premium Assets
                    </div>
                  </div>

                  <div className="w-px h-12 bg-white/30" />

                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
                      4K+
                    </div>
                    <div className="text-sm md:text-base text-white/90 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] mt-1">
                      Resolution
                    </div>
                  </div>

                  <div className="w-px h-12 bg-white/30" />

                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
                      100%
                    </div>
                    <div className="text-sm md:text-base text-white/90 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] mt-1">
                      Commercial Use
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[5]" />
          </section> */}

          <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background">
            <div className="absolute inset-0 z-0">
              {imageOfTheDay ? (
                <>
                  <Image
                    src={
                      imageOfTheDay.upscaled_url ||
                      imageOfTheDay.original_url ||
                      imageOfTheDay.file_path ||
                      "/placeholder.svg?height=1080&width=1920&query=immersive 360 panoramic futuristic landscape" ||
                      "/placeholder.svg"
                    }
                    alt="Premium 360° Assets Background"
                    fill
                    className="object-cover opacity-40 animate-kenBurnsAuction"
                    sizes="100vw"
                    priority={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
              )}

              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 animate-pulse" />
            </div>

            <div className="relative container mx-auto px-4 py-24 z-10">
              <div className="max-w-5xl mx-auto text-center space-y-12">
                <div className="inline-flex items-center gap-2.5 bg-primary/30 border-2 border-primary/50 rounded-full px-8 py-4 backdrop-blur-lg shadow-2xl">
                  <Grid3x3 className="w-6 h-6 text-primary" />
                  <span className="text-base font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    {t("cta.startExploring")}
                  </span>
                </div>

                <ParticleTitle className="min-h-[250px] flex items-center justify-center">
                  <h2 className="text-5xl md:text-6xl lg:text-8xl font-black tracking-tight text-balance leading-[1.1]">
                    <span className="text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
                      {t("cta.readyToTransform")}
                    </span>
                    <br />
                    <span className="text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">{t("cta.creativeVision")}</span>
                  </h2>
                </ParticleTitle>

                <p className="text-xl md:text-2xl lg:text-3xl text-white max-w-3xl mx-auto leading-relaxed text-pretty drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] font-medium">
                  {t("cta.joinThousands")}
                </p>

                <div className="pt-10 flex flex-wrap items-center justify-center gap-6">
                  <Link href="/collection">
                    <Button
                      size="lg"
                      className="text-2xl md:text-3xl px-12 md:px-16 py-10 md:py-12 h-auto font-black shadow-2xl shadow-primary/60 hover:shadow-[0_0_80px_rgba(139,92,246,0.8)] transition-all duration-500 hover:scale-110 bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary group relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        {t("collection.title").split(" ")[0]} {/* "Imagenes" or "Featured" */}
                        <ArrowRight className="w-8 h-8 md:w-10 md:h-10 group-hover:translate-x-3 transition-transform duration-300" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </Button>
                  </Link>

                  <Link href="/gallery">
                    <Button
                      size="lg"
                      className="text-2xl md:text-3xl px-12 md:px-16 py-10 md:py-12 h-auto font-black shadow-2xl shadow-primary/60 hover:shadow-[0_0_80px_rgba(139,92,246,0.8)] transition-all duration-500 hover:scale-110 bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary group relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        Gallery
                        <ArrowRight className="w-8 h-8 md:w-10 md:h-10 group-hover:translate-x-3 transition-transform duration-300" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </Button>
                  </Link>

                  <Link href="/collection/theatre">
                    <Button
                      size="lg"
                      className="text-2xl md:text-3xl px-12 md:px-16 py-10 md:py-12 h-auto font-black shadow-2xl shadow-primary/60 hover:shadow-[0_0_80px_rgba(139,92,246,0.8)] transition-all duration-500 hover:scale-110 bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary group relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        Theatre
                        <ArrowRight className="w-8 h-8 md:w-10 md:h-10 group-hover:translate-x-3 transition-transform duration-300" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 pt-10 text-base md:text-lg">
                  {/* <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                  <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50" />
                  <span className="font-bold text-white">132+ {t("gallery.stats.assets")}</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                  <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50" />
                  <span className="font-bold text-white">{t("stats.instantNote")}</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                  <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50" />
                  <span className="font-bold text-white">{t("comparison.ourPro5").split(" ").slice(0, 2).join(" ")}</span>
                </div> */}
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/50 to-transparent z-[5]" />
          </section>
        </main>

        <Footer />
      </div>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.imageOfTheDay?.id === nextProps.imageOfTheDay?.id &&
      prevProps.collectionImages?.length === nextProps.collectionImages?.length &&
      prevProps.auctionImages?.length === nextProps.auctionImages?.length &&
      prevProps.dailyImages?.length === nextProps.dailyImages?.length
    )
  },
)
