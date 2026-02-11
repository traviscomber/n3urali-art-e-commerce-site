'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Download, ShoppingCart } from 'lucide-react'
import { getWorkDetail } from '@/app/actions/works-actions'
import type { Work } from '@/types/works'

const getWorkById = getWorkDetail; // Declare the variable here

export default function WorkDetailPage() {
  const params = useParams()
  const workId = params.id as string
  const [work, setWork] = useState<Work | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadWork = async () => {
      try {
        setIsLoading(true)
        const data = await getWorkDetail(workId)
        setWork(data as Work | null)
      } catch (err) {
        console.error('[v0] Failed to load work:', err)
        setError('Failed to load work details')
      } finally {
        setIsLoading(false)
      }
    }

    loadWork()
  }, [workId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading work details...</p>
        </div>
      </div>
    )
  }

  if (error || !work) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Work not found'}</p>
          <Link href="/works">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Works
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <Link href="/works" className="inline-flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Works
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Hero Image */}
          <div className="lg:col-span-2">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted border border-border">
              <Image
                src={work.featured_image_url || '/placeholder.svg'}
                alt={work.work_title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Work Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">{work.work_title}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{work.audience_type}</Badge>
                <Badge variant="outline">{work.format_types}</Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                {work.cultural_inspiration}
              </p>
            </div>

            <div>
              <p className="font-semibold mb-2">Synopsis</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {work.synopsis}
              </p>
            </div>

            <div className="space-y-2">
              <Button className="w-full" size="lg">
                <ShoppingCart className="h-4 w-4 mr-2" />
                View Formats & Purchase
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Download Preview
              </Button>
            </div>
          </div>
        </div>

        {/* Formats Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Available Formats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {work.formats && work.formats.length > 0 ? (
              work.formats.map((format) => (
                <Card key={format.id} className="p-4 hover:border-primary transition-colors cursor-pointer">
                  <div className="relative w-full aspect-square rounded-md overflow-hidden mb-3 bg-muted">
                    <Image
                      src={format.thumbnail_large_url || '/placeholder.svg'}
                      alt={format.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{format.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{format.format_edition}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">${format.price}</span>
                    <Button size="sm" variant="outline">
                      Add to Cart
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground col-span-full">No formats available yet</p>
            )}
          </div>
        </div>

        {/* Licensing */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Licensing Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-2 hover:border-primary transition-colors">
              <h3 className="font-bold text-lg mb-2">Standard License</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Non-exclusive use for performances, education, and installations
              </p>
              <p className="text-2xl font-bold">Included</p>
            </Card>
            <Card className="p-6 border-2 hover:border-primary transition-colors">
              <h3 className="font-bold text-lg mb-2">Extended License</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Commercial use for brands, broadcast, and large venue installations
              </p>
              <Button className="w-full">Learn More</Button>
            </Card>
            <Card className="p-6 border-2 hover:border-primary transition-colors">
              <h3 className="font-bold text-lg mb-2">Exclusive Edition</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Removed from portal, premium pricing, custom arrangements
              </p>
              <Button variant="outline" className="w-full bg-transparent">Inquire</Button>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
