import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { notFound } from 'next/navigation'
import CollectionDetailPage from "./page"

type Props = {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  const supabase = await createClient()

  const { data: collection } = await supabase
    .from("collections")
    .select("title, description")
    .eq("code", code)
    .eq("is_active", true)
    .single()

  if (!collection) {
    return {
      title: "Collection Not Found",
    }
  }

  return {
    title: `${collection.title} - Premium 360° Collection | n3uralia360.art`,
    description: collection.description || `View the ${collection.title} collection of premium 360° images.`,
  }
}

export const revalidate = 300

export default async function Page({ params }: Props) {
  const { code } = await params
  const supabase = await createClient()

  const { data: collection, error: collectionError } = await supabase
    .from("collections")
    .select("*")
    .eq("code", code)
    .eq("is_active", true)
    .single()

  if (collectionError || !collection) {
    notFound()
  }

  const { data: collectionImageLinks } = await supabase
    .from("collection_images")
    .select("image_id, position")
    .eq("collection_id", collection.id)
    .order("position", { ascending: true })

  let images: any[] = []
  if (collectionImageLinks && collectionImageLinks.length > 0) {
    const imageIds = collectionImageLinks.map(ci => ci.image_id)
    const { data: imageData } = await supabase
      .from("images")
      .select(`
        id,
        title,
        description,
        price,
        image_format,
        thumbnail_small_url,
        thumbnail_medium_url,
        thumbnail_large_url,
        file_path,
        original_url,
        active
      `)
      .in("id", imageIds)
      .eq("active", true)
    
    images = imageData || []
  }

  return <CollectionDetailPage collection={collection} images={images} />
}
