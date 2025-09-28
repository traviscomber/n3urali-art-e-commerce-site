import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProductDetailClient } from "@/components/product-detail-client"

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

  return <ProductDetailClient image={image} />
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: image } = await supabase
    .from("images")
    .select("title, description, thumbnail_large_url")
    .eq("id", id)
    .single()

  if (!image) {
    return {
      title: "Product Not Found",
    }
  }

  return {
    title: `${image.title} - N3urali.art`,
    description: image.description,
    openGraph: {
      title: image.title,
      description: image.description,
      images: [image.thumbnail_large_url],
    },
  }
}
