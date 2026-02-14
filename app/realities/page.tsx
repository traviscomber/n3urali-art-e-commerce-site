import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { RealitiesClient } from "./realities-client"

export const metadata: Metadata = {
  title: "R3alities — Cinematic Dome Stories | N3uralia360",
  description:
    "Immersive cinematic experiences designed for full-dome installations. Seamless performance loops, VR-ready environments, and cultural storytelling.",
  keywords: ["R3alities", "dome cinema", "360 experiences", "immersive stories", "seamless loops", "VR ready"],
}

export const revalidate = 600

export default async function RealitiesPage() {
  const supabase = await createClient()

  // Fetch R3alities content from database
  const { data: realitiesContent } = await supabase
    .from("images")
    .select("id, title, file_path, original_url, upscaled_url, price, image_format, thumbnail_medium_url, description")
    .eq("featured_collection", true)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(20)

  return <RealitiesClient initialContent={realitiesContent || []} />
}
