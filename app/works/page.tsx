'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { getWorks } from '@/app/actions/works-actions'
import type { Work } from '@/types/works'

// Mark this page as dynamic since it uses client-side hooks and search parameters
export const dynamic = 'force-dynamic'

export default function WorksPage() {
  const [works, setWorks] = useState<Work[]>([])
  const [filteredWorks, setFilteredWorks] = useState<Work[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAudience, setSelectedAudience] = useState<string | null>(null)

  useEffect(() => {
    const loadWorks = async () => {
      try {
        setIsLoading(true)
        const response = await getWorks(50, 0)
        setWorks(response.works)
        setFilteredWorks(response.works)
      } catch (error) {
        console.error('[v0] Failed to load works:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadWorks()
  }, [])

  useEffect(() => {
    let results = works

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      results = results.filter(
        (work) =>
          work.work_title.toLowerCase().includes(query) ||
          (work.synopsis?.toLowerCase() || "").includes(query) ||
          (work.cultural_inspiration?.toLowerCase() || "").includes(query)
      )
    }

    // Filter by audience
    if (selectedAudience) {
      results = results.filter((work) => work.audience_type === selectedAudience)
    }

    setFilteredWorks(results)
  }, [searchQuery, selectedAudience, works])

  const audiences = Array.from(new Set(works.map((w) => w.audience_type).filter((a) => a !== undefined)))

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            N3uralia Immersive Works
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore our curated collection of immersive films, environments, and performance loops—
            created at the intersection of cultural research, artistic vision, and cutting-edge formats.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-12 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search works by title, synopsis, or cultural inspiration..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedAudience === null ? 'default' : 'outline'}
              onClick={() => setSelectedAudience(null)}
            >
              All Works
            </Button>
            {audiences.map((audience) => (
              <Button
                key={audience}
                variant={selectedAudience === audience ? 'default' : 'outline'}
                onClick={() => setSelectedAudience(audience)}
              >
                {audience}
              </Button>
            ))}
          </div>
        </div>

        {/* Works Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
        ) : filteredWorks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorks.map((work) => (
              <Link key={work.id} href={`/works/${work.id}`}>
                <Card className="h-full overflow-hidden hover:border-primary transition-all duration-300 cursor-pointer group">
                  {/* Hero Image */}
                  <div className="relative w-full aspect-video overflow-hidden bg-muted">
                    <Image
                      src="/placeholder.svg"
                      alt={work.work_title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {work.work_title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">{work.cultural_inspiration}</p>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {work.synopsis}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {work.audience_type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {work.format_types}
                      </Badge>
                    </div>

                    <Button className="w-full mt-2" size="sm">
                      View Work
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No works found matching your filters.</p>
            <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedAudience(null) }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
