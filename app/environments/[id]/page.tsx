import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import { EnvironmentVideoDetailClient } from "@/components/environment-video-detail-client"

interface EnvironmentVideo {
  id: string
  title: string
  description: string
  category_id: string
  original_url: string
  thumbnail_medium_url: string
  image_format: string
  price: number
  active: boolean
  created_at: string
}

export const revalidate = 3600

export default async function EnvironmentVideoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Check if this is a placeholder ID (not a UUID)
  const isPlaceholder = !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)

  let video = null
  let category = null
  let relatedVideos = []
  let natureSectionVideos = []

  if (!isPlaceholder) {
    // Try to fetch the video/environment from database
    const { data: fetchedVideo, error } = await supabase
      .from("images")
      .select("*")
      .eq("id", id)
      .eq("active", true)
      .single()

    video = fetchedVideo
    
    if (video) {
      // Fetch category info
      const { data: cat } = await supabase
        .from("categories")
        .select("*")
        .eq("id", video.category_id)
        .single()
      category = cat

      // Fetch related videos (same category)
      const { data: related } = await supabase
        .from("images")
        .select("*")
        .eq("category_id", video.category_id)
        .eq("active", true)
        .neq("id", id)
        .limit(4)
      relatedVideos = related || []
    }
  }

  // If no video found or placeholder ID, use mock data
  if (!video) {
    // Extract category name from placeholder ID (e.g., "nature-showcase-4" -> "Nature")
    let categoryName = "Nature"
    if (id.includes("volcano")) categoryName = "Volcanoes"
    if (id.includes("ocean")) categoryName = "Oceans"
    if (id.includes("ice")) categoryName = "Ice & Snow"
    if (id.includes("forest")) categoryName = "Forest"

    const { data: mockCategory } = await supabase
      .from("categories")
      .select("*")
      .eq("name", categoryName)
      .single()
    category = mockCategory

    // Create mock video data for showcase
    video = {
      id,
      title: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      description: `A stunning ${categoryName.toLowerCase()} environment video showcasing breathtaking natural scenes perfect for immersive dome installations and event programming.`,
      category_id: mockCategory?.id || '',
      original_url: 'https://via.placeholder.com/1920x1080?text=Video+Preview',
      thumbnail_medium_url: 'https://via.placeholder.com/1280x720?text=Video',
      image_format: '4096 x 4096',
      price: 2500,
      active: true,
      created_at: new Date().toISOString(),
    }

    // Fetch related videos from the category if category found
    if (mockCategory) {
      const { data: related } = await supabase
        .from("images")
        .select("*")
        .eq("category_id", mockCategory.id)
        .eq("active", true)
        .limit(4)
      relatedVideos = related || []
    }
  }

  // Fetch Nature category videos for recommendations
  const { data: natureCategory } = await supabase
    .from("categories")
    .select("id")
    .eq("name", "Nature")
    .single()

  const { data: natureSectionData } = await supabase
    .from("images")
    .select("*")
    .eq("category_id", natureCategory?.id || "")
    .eq("active", true)
    .neq("id", id)
    .limit(4)
  natureSectionVideos = natureSectionData || []

  return (
    <main className="min-h-screen bg-black text-white">
      <EnvironmentVideoDetailClient 
        video={video}
        category={category}
        relatedVideos={relatedVideos}
        natureSectionVideos={natureSectionVideos}
      />
    </main>
  )
}
