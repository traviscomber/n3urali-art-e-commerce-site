"use client"
import { Button } from "@/components/ui/button"
import { ArrowRight, Package2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/lib/contexts/language-context"

export default function CollectionsPageClient({ collectionsWithPreviews }: { collectionsWithPreviews: any[] }) {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />

        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance text-foreground">
              {t("collections.title")}
              <span className="block text-primary mt-2">{t("collections.titleHighlight")}</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
              {t("collections.subtitle")}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{collectionsWithPreviews.length}</div>
                <div className="text-sm text-muted-foreground">{t("collections.stats.collections")}</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">8K–16K</div>
                <div className="text-sm text-muted-foreground">{t("collections.stats.resolution")}</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">VR Ready</div>
                <div className="text-sm text-muted-foreground">{t("collections.stats.format")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          {collectionsWithPreviews.length === 0 ? (
            <div className="text-center py-20 max-w-lg mx-auto space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Package2 className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">{t("collections.coming.soon")}</h3>
                <p className="text-muted-foreground">{t("collections.coming.desc")}</p>
              </div>
              <Button size="lg" asChild>
                <Link href="/gallery">
                  {t("collections.coming.exploreImages")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-32">
              {collectionsWithPreviews.map((collection, index) => (
                <article key={collection.id} className="group max-w-7xl mx-auto">
                  {collection.childCount > 0 ? (
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                      {/* Image Showcase - same as regular collections */}
                      <div className="relative">
                        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                          {collection.previewImages.length > 0 ? (
                            <div className="flex flex-col gap-4 h-full">
                              {/* EQUIRECTANGULAR SECTION - Top section with label */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="text-xs font-bold uppercase tracking-wider text-primary">
                                    Equirectangular Format
                                  </div>
                                  <div className="h-px flex-1 bg-primary/20" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  {/* Two large equirectangular panoramic images */}
                                  {collection.previewImages.slice(0, 2).map((image: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="relative aspect-[2/1] overflow-hidden rounded-lg bg-muted"
                                    >
                                      <Image
                                        src={
                                          image?.thumbnail_large_url ||
                                          image?.thumbnail_medium_url ||
                                          image?.file_path ||
                                          image?.original_url ||
                                          `/placeholder.svg?height=400&width=800&text=${encodeURIComponent(image?.title || "Equirectangular")}`
                                        }
                                        alt={image?.title || "Equirectangular panorama"}
                                        fill
                                        className="object-cover transition-all duration-700 group-hover:scale-105"
                                        sizes="(max-width: 1024px) 50vw, 25vw"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* DOME SECTION - Bottom section with label */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="text-xs font-bold uppercase tracking-wider text-secondary-foreground">
                                    Dome Format
                                  </div>
                                  <div className="h-px flex-1 bg-secondary/20" />
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                  {/* Four square dome format images */}
                                  {collection.previewImages.slice(2, 6).map((image: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="relative aspect-square overflow-hidden rounded-lg bg-muted"
                                    >
                                      <Image
                                        src={
                                          image?.thumbnail_large_url ||
                                          image?.thumbnail_medium_url ||
                                          image?.file_path ||
                                          image?.original_url ||
                                          `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(image?.title || "Dome")}`
                                        }
                                        alt={image?.title || "Dome projection"}
                                        fill
                                        className="object-cover transition-all duration-700 group-hover:scale-105"
                                        sizes="(max-width: 1024px) 25vw, 12vw"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full bg-muted">
                              <Package2 className="h-20 w-20 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Floating badge with sub-collection count */}
                        <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg">
                          <div className="text-sm font-semibold">
                            {collection.childCount} {t("collections.stats.collections")}
                          </div>
                        </div>
                      </div>

                      {/* Content - matching single collection style */}
                      <div className="space-y-6">
                        <div className="space-y-3">
                          {/* {collection.code && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {collection.code}
                            </Badge>
                          )} */}

                          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                            {collection.title}
                          </h2>
                        </div>

                        {collection.description && (
                          <p className="text-lg text-muted-foreground leading-relaxed line-clamp-2">
                            {collection.description}
                          </p>
                        )}

                        {/* Child Collections List */}
                        <div className="space-y-3 pt-4">
                          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                            {t("collections.subcollections")}
                          </h3>
                          <div className="space-y-3">
                            {collection.childCollections.map((child: any) => (
                              <Link key={child.id} href={`/collection/${child.code}`} className="group/child block">
                                <div className="rounded-lg border-2 border-border hover:border-primary transition-all duration-300 p-4 hover:shadow-lg hover:bg-primary/5 bg-muted/30">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-semibold text-foreground group-hover/child:text-primary transition-colors">
                                      {child.title}
                                    </h4>
                                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover/child:text-primary group-hover/child:translate-x-1 transition-all" />
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 pt-2">
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">{t("collections.format")}</div>
                            <div className="font-semibold text-foreground">{t("collections.format.360")}</div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">{t("collections.license")}</div>
                            <div className="font-semibold text-foreground">{t("collections.license.commercial")}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Existing single collection display */
                    <Link href={`/collection/${collection.code}`} className="block">
                      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        {/* Image Showcase - Always on the left */}
                        <div className="relative">
                          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl">
                            {collection.previewImages.length > 0 ? (
                              <div className="flex flex-col gap-4 h-full">
                                {/* EQUIRECTANGULAR SECTION - Top section with label */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <div className="text-xs font-bold uppercase tracking-wider text-primary">
                                      Equirectangular Format
                                    </div>
                                    <div className="h-px flex-1 bg-primary/20" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    {/* Two large equirectangular panoramic images */}
                                    {collection.previewImages.slice(0, 2).map((image: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className="relative aspect-[2/1] overflow-hidden rounded-lg bg-muted"
                                      >
                                        <Image
                                          src={
                                            image?.thumbnail_large_url ||
                                            image?.thumbnail_medium_url ||
                                            image?.file_path ||
                                            image?.original_url ||
                                            `/placeholder.svg?height=400&width=800&text=${encodeURIComponent(image?.title || "Equirectangular")}`
                                          }
                                          alt={image?.title || "Equirectangular panorama"}
                                          fill
                                          className="object-cover transition-all duration-700 group-hover:scale-105"
                                          sizes="(max-width: 1024px) 50vw, 25vw"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* DOME SECTION - Bottom section with label */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <div className="text-xs font-bold uppercase tracking-wider text-secondary-foreground">
                                      Dome Format
                                    </div>
                                    <div className="h-px flex-1 bg-secondary/20" />
                                  </div>
                                  <div className="grid grid-cols-4 gap-2">
                                    {/* Four square dome format images */}
                                    {collection.previewImages.slice(2, 6).map((image: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className="relative aspect-square overflow-hidden rounded-lg bg-muted"
                                      >
                                        <Image
                                          src={
                                            image?.thumbnail_large_url ||
                                            image?.thumbnail_medium_url ||
                                            image?.file_path ||
                                            image?.original_url ||
                                            `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(image?.title || "Dome")}`
                                          }
                                          alt={image?.title || "Dome projection"}
                                          fill
                                          className="object-cover transition-all duration-700 group-hover:scale-105"
                                          sizes="(max-width: 1024px) 25vw, 12vw"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full bg-muted">
                                <Package2 className="h-20 w-20 text-muted-foreground" />
                              </div>
                            )}

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center p-8">
                              <Button size="lg" variant="secondary" className="gap-2">
                                {t("collections.exploreCollection")}
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Content - Always on the right */}
                        <div className="space-y-6">
                          <div className="space-y-3">
                            {/* {collection.code && (
                              <Badge variant="outline" className="font-mono text-xs">
                                {collection.code}
                              </Badge>
                            )} */}

                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                              {collection.title}
                            </h2>
                          </div>

                          {collection.description && (
                            <p className="text-lg text-muted-foreground leading-relaxed line-clamp-2">
                              {collection.description}
                            </p>
                          )}

                          {collection.individualTotal > 0 && (
                            <div className="rounded-xl border-2 border-primary/20 bg-card bg-gradient-to-br from-primary/5 to-primary/10 p-8 shadow-lg">
                              <div className="grid grid-cols-3 gap-6 text-center">
                                <div className="space-y-2">
                                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    {t("collections.individualPurchase")}
                                  </div>
                                  <div className="text-xl font-semibold line-through text-muted-foreground opacity-70">
                                    ${collection.individualTotal.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-muted-foreground leading-tight">
                                    {t("collections.buyingSeparately").replace(
                                      "{count}",
                                      collection.imageCount.toString(),
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-2 relative">
                                  <div className="absolute -inset-3 bg-primary/10 rounded-xl blur-xl" />
                                  <div className="relative space-y-2">
                                    <div className="text-xs font-bold text-primary uppercase tracking-wide">
                                      {t("collections.bundlePrice")}
                                    </div>
                                    <div className="text-5xl font-black text-primary drop-shadow-sm">
                                      ${collection.bundle_price}
                                    </div>
                                    <div className="text-xs font-medium text-primary/80">
                                      {t("collections.completeCollection")}
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
                                    {t("collections.youSave")}
                                  </div>
                                  <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                                    ${collection.savings.toFixed(2)}
                                  </div>
                                  <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 text-sm font-bold">
                                    {collection.savingsPercent}% OFF
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-6 pt-2">
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">{t("collections.format")}</div>
                              <div className="font-semibold text-foreground">{t("collections.format.360")}</div>
                            </div>

                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">{t("collections.license")}</div>
                              <div className="font-semibold text-foreground">{t("collections.license.commercial")}</div>
                            </div>
                          </div>

                          <Button size="lg" className="gap-2 group/btn mt-6">
                            {t("collections.viewFull")}
                            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </Link>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t("collections.preferIndividual")}</h2>
            <p className="text-lg text-muted-foreground">{t("collections.browseGallery")}</p>
            <Button size="lg" variant="default" className="gap-2" asChild>
              <Link href="/gallery">
                {t("collections.browseButton")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
