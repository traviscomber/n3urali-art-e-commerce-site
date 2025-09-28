import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProductDetailClient } from "@/components/product-detail-client"
import { ImageUrlHandler } from "@/lib/image-url-handler"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: image, error } = await supabase
    .from("images")
    .select(`
      *,
      categories (
        id,
        name,
        description
      ),
      licenses (
        id,
        name,
        description
      )
    `)
    .eq("id", id)
    .eq("active", true)
    .single()

  if (error || !image) {
    notFound()
  }

  const displayUrl = image.file_path
    ? ImageUrlHandler.convertToDisplayUrl(image.file_path, { useProxy: true })
    : image.file_path

  const processedImage = {
    ...image,
    image_url: displayUrl,
    thumbnail_url: displayUrl,
    thumbnail_large_url: displayUrl,
    thumbnail_medium_url: displayUrl,
    thumbnail_small_url: displayUrl,
    original_url: displayUrl,
    file_path: displayUrl, // Ensure file_path also uses proxy URL
  }

  return <ProductDetailClient image={processedImage} />
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: image } = await supabase.from("images").select("title, description, file_path").eq("id", id).single()

  if (!image) {
    return {
      title: "Product Not Found",
    }
  }

  const displayUrl = image.file_path
    ? ImageUrlHandler.convertToDisplayUrl(image.file_path, { useProxy: true })
    : image.file_path

  return {
    title: `${image.title} - N3urali.art`,
    description: image.description,
    openGraph: {
      title: image.title,
      description: image.description,
      images: [displayUrl],
    },
  }
}
