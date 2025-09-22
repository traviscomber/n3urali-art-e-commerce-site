import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import PhotoDetailClient from "./photo-detail-client"

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient()

  const { data: image } = await supabase
    .from("images")
    .select(`
      *,
      categories(name),
      licenses(name)
    `)
    .eq("id", params.id)
    .single()

  if (!image) {
    return {
      title: "Image Not Found | N3urali.art",
      description: "The requested image could not be found.",
    }
  }

  const title = `${image.title} - Premium ${image.categories?.name || "360°"} Image | N3urali.art`
  const description =
    image.description ||
    `Professional ${image.categories?.name || "360°"} photography perfect for VR, projection mapping, and architectural visualization. AI-generated and enhanced for supreme quality.`
  const imageUrl = image.thumbnail_large_url || image.thumbnail_medium_url || image.thumbnail_small_url
  const canonicalUrl = `https://n3urali.com/photo/${image.id}`

  return {
    title,
    description,
    keywords: [
      image.categories?.name?.toLowerCase() || "360",
      "360 photography",
      "VR content",
      "projection mapping",
      "AI generated",
      "premium imagery",
      "digital art",
      "immersive media",
    ],
    authors: [{ name: "N3urali.art", url: "https://n3urali.com" }],
    creator: "N3urali.art",
    publisher: "N3urali.art",
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      locale: "en_US",
      url: canonicalUrl,
      siteName: "N3urali.art",
      title,
      description,
      images: [
        {
          url: imageUrl || "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: image.title,
        },
      ],
      publishedTime: image.created_at,
      modifiedTime: image.updated_at || image.created_at,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl || "/og-image.jpg"],
      creator: "@n3urali",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}

export default async function PhotoDetailPage({ params }: Props) {
  const supabase = await createClient()

  const { data: image } = await supabase
    .from("images")
    .select(`
      *,
      categories(name, description),
      licenses(name, description)
    `)
    .eq("id", params.id)
    .single()

  if (!image) {
    notFound()
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "@id": `https://n3urali.com/photo/${image.id}#image`,
    name: image.title,
    description: image.description || `Professional ${image.categories?.name || "360°"} photography`,
    url: image.original_url,
    thumbnailUrl: image.thumbnail_large_url,
    contentUrl: image.original_url,
    width: "4000",
    height: "2000",
    encodingFormat: "image/jpeg",
    uploadDate: image.created_at,
    dateModified: image.updated_at || image.created_at,
    creator: {
      "@type": "Organization",
      "@id": "https://n3urali.com/#organization",
      name: "N3urali.art",
      url: "https://n3urali.com",
    },
    publisher: {
      "@type": "Organization",
      "@id": "https://n3urali.com/#organization",
    },
    license: "https://n3urali.com/license",
    acquireLicensePage: `https://n3urali.com/photo/${image.id}`,
    creditText: "N3urali.art",
    copyrightNotice: "© N3urali.art - All rights reserved",
    usageInfo: "https://n3urali.com/license",
    isPartOf: {
      "@type": "ImageGallery",
      name: "N3urali.art Premium 360° Image Collection",
      url: "https://n3urali.com/gallery",
    },
    offers: {
      "@type": "Offer",
      price: image.price?.toString() || "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        "@id": "https://n3urali.com/#organization",
      },
    },
    keywords: [
      image.categories?.name?.toLowerCase() || "360",
      "360 photography",
      "VR content",
      "projection mapping",
      "AI generated imagery",
      "premium digital art",
    ].join(", "),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <PhotoDetailClient initialImage={image} />
    </>
  )
}
