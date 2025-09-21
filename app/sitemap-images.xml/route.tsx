import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET() {
  const baseUrl = "https://n3urali.com"

  // Create Supabase client
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  // Get all active images
  const { data: images } = await supabase
    .from("images")
    .select("id, title, description, image_url, thumbnail_url, category, created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  const imageEntries =
    images
      ?.map(
        (image) => `
    <url>
      <loc>${baseUrl}/photo/${image.id}</loc>
      <image:image>
        <image:loc>${image.image_url}</image:loc>
        <image:title>${escapeXml(image.title || "Premium 360° Image")}</image:title>
        <image:caption>${escapeXml(image.description || `Professional ${image.category} 360° photography`)}</image:caption>
        <image:license>${baseUrl}/license</image:license>
      </image:image>
      ${
        image.thumbnail_url
          ? `
      <image:image>
        <image:loc>${image.thumbnail_url}</image:loc>
        <image:title>${escapeXml(image.title || "Premium 360° Image")} - Thumbnail</image:title>
        <image:caption>Thumbnail preview of ${escapeXml(image.title || "premium 360° image")}</image:caption>
      </image:image>
      `
          : ""
      }
      <lastmod>${new Date(image.created_at).toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>
  `,
      )
      .join("") || ""

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${imageEntries}
</urlset>`

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;"
      case ">":
        return "&gt;"
      case "&":
        return "&amp;"
      case "'":
        return "&apos;"
      case '"':
        return "&quot;"
      default:
        return c
    }
  })
}
