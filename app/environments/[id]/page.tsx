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

  // Fetch the video/environment
  const { data: video, error } = await supabase
    .from("images")
    .select("*")
    .eq("id", id)
    .eq("active", true)
    .single()

  if (error || !video) {
    notFound()
  }

  // Fetch category info
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", video.category_id)
    .single()

  // Fetch related videos (same category)
  const { data: relatedVideos } = await supabase
    .from("images")
    .select("*")
    .eq("category_id", video.category_id)
    .eq("active", true)
    .neq("id", id)
    .limit(4)

  // Fetch Nature category videos for recommendations
  const { data: natureCategory } = await supabase
    .from("categories")
    .select("id")
    .eq("name", "Nature")
    .single()

  const { data: natureSectionVideos } = await supabase
    .from("images")
    .select("*")
    .eq("category_id", natureCategory?.id || "")
    .eq("active", true)
    .neq("id", id)
    .limit(4)

  return (
    <main className="min-h-screen bg-black text-white">
      <EnvironmentVideoDetailClient 
        video={video}
        category={category}
        relatedVideos={relatedVideos || []}
        natureSectionVideos={natureSectionVideos || []}
      />
    </main>
  )
}
