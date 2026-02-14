import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { EnvironmentsClient } from "./environments-client"

export const metadata: Metadata = {
  title: "Environments — Living Immersive Catalog | N3uralia360",
  description:
    "Continuous atmospheric loops optimized for dome perception. Flexible immersive environments ready for integration into any venue or experience.",
  keywords: ["dome environments", "atmospheric loops", "immersive catalog", "continuous loops", "dome installation"],
}

export const revalidate = 600

export default async function EnvironmentsPage() {
  const supabase = await createClient()

  // Fetch Environments content from database
  const { data: environmentsContent } = await supabase
    .from("images")
    .select("id, title, file_path, original_url, upscaled_url, price, image_format, thumbnail_medium_url, description")
    .eq("featured_collection", true)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(20)

  return <EnvironmentsClient initialContent={environmentsContent || []} />
}
