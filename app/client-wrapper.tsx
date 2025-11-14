"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, HelpCircle, Sparkles, Grid3x3, User } from "lucide-react"
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
      const minutesLeft = 59 - now.getMinutes()
      const secondsLeft = 59 - now.getSeconds()
      return { minutes: minutesLeft, seconds: secondsLeft }
    }

    setAuctionTimeLeft(calculateTimeLeft())
    const interval = setInterval(() => {
      setAuctionTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {imageOfTheDay && (
        <section className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />

          <div className="relative container mx-auto px-4">
            <div className="max-w-7xl mx-auto space-y-12">
              <div className="text-center space-y-6">
                <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20 text-sm px-4 py-2">
                  {t("imageOfTheDay")}
                </Badge>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
                  {t("premium360Imagery")}
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                  {t("experienceQuality")}
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
                          <span className="text-white/80">{t("ultraHighResolution")}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge className="bg-gradient-to-r from-yellow-400/40 to-orange-500/40 text-black font-bold text-lg px-4 py-2 border-0 animate-pulse">
                          {t("20PercentOffToday")}
                        </Badge>
                        <Link href={`/photo/${imageOfTheDay.id}`}>
                          <Button size="lg" className="bg-primary hover:bg-primary/90 w-full mt-2">
                            {t("viewDetailsPrice")}
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
                {t("premiumCollection")}
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold">{t("curatedImages")}</h2>
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
                        {t("15PercentOff")}
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
                        {t("15PercentOff")}
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
                {t("viewCompleteCollection")}
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
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">{t("catchBestPrices")}</h2>

                  <div className="flex justify-center mt-8">
                    <div className="flex items-center gap-6 md:gap-8">
                      {/* Minutes */}
                      <div className="text-center">
                        <div
                          className="text-6xl md:text-7xl lg:text-8xl font-thin tabular-nums"
                          style={{ color: "#392A48" }}
                        >
                          {auctionTimeLeft.minutes.toString().padStart(2, "0")}
                        </div>
                        <div
                          className="text-xs md:text-sm uppercase tracking-widest font-light mt-2"
                          style={{ color: "#392A48" }}
                        >
                          {t("minutes") || "Minutos"}
                        </div>
                      </div>

                      {/* Separator */}
                      <div className="text-5xl md:text-6xl lg:text-7xl font-thin" style={{ color: "#392A48" }}>
                        :
                      </div>

                      {/* Seconds */}
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
                          {t("seconds") || "Segundos"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-6">
                    {t("pricesDropEveryMinute")}
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
              {t("pricesResetEveryHour")}
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
                    <h2 className="text-3xl font-bold">{t("collection")}</h2>
                    <p className="text-muted-foreground text-lg">{t("curatedImages")}</p>
                    <div className="pt-2">
                      <div className="text-4xl font-bold text-primary">$999</div>
                      <div className="text-sm text-muted-foreground">{t("completeBundle")}</div>
                    </div>
                  </div>

                  <Button
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    size="lg"
                  >
                    {t("viewCollection")}
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
                    <h2 className="text-3xl font-bold">{t("gallery")}</h2>
                    <p className="text-muted-foreground text-lg">{t("browseAllImages")}</p>
                    <div className="pt-2">
                      <div className="text-4xl font-bold">130+</div>
                      <div className="text-sm text-muted-foreground">{t("premiumImages")}</div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors bg-transparent"
                    size="lg"
                  >
                    {t("browseGallery")}
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
                    <h2 className="text-3xl font-bold">{t("signIn")}</h2>
                    <p className="text-muted-foreground text-lg">{t("instantDownloadAccess")}</p>
                    <div className="pt-2">
                      <div className="text-lg font-semibold">{t("instant")}</div>
                      <div className="text-sm text-muted-foreground">{t("downloadAccess")}</div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors bg-transparent"
                    size="lg"
                  >
                    {t("signIn")}
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
                <p className="text-muted-foreground">{t("ultraHighResolution")}</p>
              </div>
              <div className="space-y-3">
                <div className="text-4xl font-bold">Instant</div>
                <p className="text-muted-foreground">{t("downloadAfterPurchase")}</p>
              </div>
              <div className="space-y-3">
                <div className="text-4xl font-bold text-primary">VR Ready</div>
                <p className="text-muted-foreground">{t("perfectForImmersive")}</p>
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
                {t("featuredGallery")}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">{t("exploreOurPremium")}</h2>
              <p className="text-lg text-muted-foreground text-pretty">{t("browseOurCurated")}</p>
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
                <Badge variant="secondary">{t("faq")}</Badge>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">{t("everythingYouNeed")}</h2>
              <p className="text-lg text-muted-foreground text-pretty">{t("commonQuestions")}</p>
            </div>

            <div className="space-y-8">
              <div className="bg-card rounded-lg px-6 py-8 space-y-4">
                <h3 className="text-xl font-semibold">{t("faqQ1")}</h3>
                <p className="text-muted-foreground">{t("faqA1")}</p>
              </div>

              <div className="bg-card rounded-lg px-6 py-8 space-y-4">
                <h3 className="text-xl font-semibold">{t("faqQ2")}</h3>
                <p className="text-muted-foreground">{t("faqA2")}</p>
              </div>

              <div className="bg-card rounded-lg px-6 py-8 space-y-4">
                <h3 className="text-xl font-semibold">{t("faqQ3")}</h3>
                <p className="text-muted-foreground">{t("faqA3")}</p>
              </div>

              <div className="bg-card rounded-lg px-6 py-8 space-y-4">
                <h3 className="text-xl font-semibold">{t("faqQ4")}</h3>
                <p className="text-muted-foreground">{t("faqA4")}</p>
              </div>

              <div className="bg-card rounded-lg px-6 py-8 space-y-4">
                <h3 className="text-xl font-semibold">{t("faqQ5")}</h3>
                <p className="text-muted-foreground">{t("faqA5")}</p>
              </div>

              <div className="bg-card rounded-lg px-6 py-8 space-y-4">
                <h3 className="text-xl font-semibold">{t("faqQ6")}</h3>
                <p className="text-muted-foreground">{t("faqA6")}</p>
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
              {t("readyToTransform")}
              <span className="text-primary block">{t("creativeVision")}</span>
            </h2>

            <p className="text-xl text-muted-foreground text-pretty">{t("joinThousands")}</p>

            <Button size="lg" className="glow-primary">
              <Link href="/gallery" className="flex items-center gap-2">
                {t("startExploring")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
