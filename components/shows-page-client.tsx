"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Filter, Search, Play } from "lucide-react"
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

interface ShowsClientProps {
  initialContent: ContentItem[]
}

export function ShowsClient({ initialContent }: ShowsClientProps) {
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
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto max-w-6xl">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-2">
              <Play className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-cyan-300">Cinematic Experiences</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Cinematic Dome Stories
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                With Timing
              </span>
            </h1>

            <p className="text-lg text-slate-300 max-w-3xl mx-auto">
              Not loops. Not static backdrops. Real stories that unfold.
            </p>

            <p className="text-base text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Realities are AI-animated immersive experiences with progression, rhythm, and visual timing. Designed as mini-shows that hold audience attention from beginning to end.
            </p>

            <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-6 max-w-3xl mx-auto">
              <h3 className="text-lg font-bold text-white mb-4">Perfect for:</h3>
              <ul className="grid md:grid-cols-2 gap-3 text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  School dome programming
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  Festival headline segments
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  Branded immersive presentations
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  Themed event openings
                </li>
              </ul>
            </div>

            <div className="mt-8 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20 rounded-xl p-6 max-w-3xl mx-auto">
              <p className="text-slate-300 font-semibold mb-2">Each Reality includes:</p>
              <p className="text-slate-400 text-sm">
                Full-dome fisheye version • Optional VR equirectangular edition • Structured runtime with narrative flow • Clean projection-ready delivery
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 pt-4">
              <Link href="/studio">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Commission Custom Work
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Key features */}
          <div className="grid md:grid-cols-4 gap-4 bg-slate-800/40 rounded-xl border border-slate-700 p-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-400 mb-1">{initialContent.length}</p>
              <p className="text-sm text-slate-400">Immersive Stories</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-400 mb-1">{formats.length}</p>
              <p className="text-sm text-slate-400">Format Types</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-400 mb-1">4K+</p>
              <p className="text-sm text-slate-400">Resolution</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-400 mb-1">VR Ready</p>
              <p className="text-sm text-slate-400">All Formats</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="sticky top-0 z-40 py-6 px-4 bg-background/95 backdrop-blur border-b border-slate-700">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
              <Input
                placeholder="Search R3alities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-400"
              />
            </div>

            {/* Format Filter */}
            {formats.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
                <Filter className="w-5 h-5 text-slate-400" />
                <select
                  value={selectedFormat || ""}
                  onChange={(e) => setSelectedFormat(e.target.value || null)}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm cursor-pointer hover:border-slate-600"
                >
                  <option value="">All Formats</option>
                  {formats.map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Results count */}
            <div className="text-sm text-slate-400">
              {filteredContent.length} of {initialContent.length} stories
            </div>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {filteredContent.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map((item) => (
                <Link key={item.id} href={`/photo/${item.id}`}>
                  <Card className="group relative h-96 overflow-hidden bg-slate-800/40 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer">
                    {/* Image */}
                    <Image
                      src={item.upscaled_url || item.original_url || item.file_path || "/placeholder.svg"}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    {/* Format badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-xs font-semibold text-cyan-300 backdrop-blur-sm">
                      {item.image_format}
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-3">
                      <div>
                        <h3 className="text-lg font-bold line-clamp-2">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-slate-300 line-clamp-1 mt-1">{item.description}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">VR Ready</span>
                        <div className="flex items-center gap-1 text-cyan-400 group-hover:translate-x-1 transition-transform">
                          <span className="text-sm">View</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 space-y-4">
              <p className="text-lg text-slate-400">No stories found matching your search.</p>
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedFormat(null)
                }}
                variant="outline"
                className="border-slate-600 text-slate-200 hover:bg-slate-800/50"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-900/50 to-background">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-12 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Looking for Something Custom?</h2>
            <p className="text-slate-300 text-lg">
              Our studio team creates bespoke immersive experiences tailored to your venue, brand, or cultural narrative.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link href="/studio">
                <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                  Explore Studio Services
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-slate-200 hover:bg-slate-800/50"
              >
                Request Quote
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
