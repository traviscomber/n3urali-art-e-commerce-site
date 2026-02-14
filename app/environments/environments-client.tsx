"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Filter, Search, LayoutGrid } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Footer } from "@/components/footer"

interface ContentItem {
  id: string
  title: string
  file_path: string
  original_url: string | null
  upscaled_url: string | null
  price: number
  image_format: string
  thumbnail_medium_url?: string
  description?: string
}

interface EnvironmentsClientProps {
  initialContent: ContentItem[]
}

export function EnvironmentsClient({ initialContent }: EnvironmentsClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null)

  // Format categories
  const formats = useMemo(() => {
    const unique = new Set(initialContent.map((item) => item.image_format))
    return Array.from(unique).sort()
  }, [initialContent])

  // Filter content
  const filteredContent = useMemo(() => {
    return initialContent.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFormat = !selectedFormat || item.image_format === selectedFormat
      return matchesSearch && matchesFormat
    })
  }, [initialContent, searchQuery, selectedFormat])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-slate-900/50 via-slate-900/30 to-background">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-emerald-500/10 via-transparent to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-gradient-radial from-teal-500/5 via-transparent to-transparent blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto max-w-6xl">
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              Endless Immersive
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Backdrops
              </span>
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
              Seamless dome loops designed for performance and programming.
            </p>

            <p className="text-base text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Environments are continuous immersive loops crafted using professional motion tools — rotation, zoom, distortion, layered effects — tuned specifically for dome perception.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-10 max-w-4xl mx-auto">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="font-bold text-emerald-300 mb-2">For dome owners:</h3>
                <p className="text-sm text-slate-400">Endless themed nights without rebuilding your show.</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="font-bold text-emerald-300 mb-2">For VJs:</h3>
                <p className="text-sm text-slate-400">Clean, seamless material ready to layer and mix.</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="font-bold text-emerald-300 mb-2">For event producers:</h3>
                <p className="text-sm text-slate-400">Ambient premium visuals that elevate any space.</p>
              </div>
            </div>

            <div className="mt-10 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-6 max-w-3xl mx-auto">
              <p className="text-slate-300 font-semibold mb-3">Features:</p>
              <p className="text-slate-400 text-sm">
                True seamless structure • Dome-correct center mapping • Clean motion (no artifact noise) • Ready for long-duration projection
              </p>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                placeholder="Search environments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={selectedFormat || ""}
                onChange={(e) => setSelectedFormat(e.target.value || null)}
                className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 text-sm"
              >
                <option value="">All Formats</option>
                {formats.map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-slate-400 mb-6">
            Showing {filteredContent.length} of {initialContent.length} environments
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          {filteredContent.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map((item) => (
                <Link key={item.id} href={`/photo/${item.id}`}>
                  <Card className="group overflow-hidden bg-slate-800/40 border-slate-700 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer h-full">
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={item.upscaled_url || item.original_url || item.file_path || "/placeholder.svg"}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="text-sm text-emerald-400/80 mt-1">{item.image_format}</p>
                        </div>
                      </div>

                      {item.description && (
                        <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">{item.description}</p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                        <span className="text-xs text-slate-400">View Details</span>
                        <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <LayoutGrid className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-300 mb-2">No environments found</h3>
              <p className="text-slate-400">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-slate-900/50 via-slate-900/30 to-background">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-12 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Need a Custom Environment?</h2>
            <p className="text-slate-300 text-lg">
              Our Studio can create bespoke atmospheric environments tailored to your venue or experience needs.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link href="/studio">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Explore Studio Services
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-800/50">
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
