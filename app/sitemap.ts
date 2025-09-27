import type { MetadataRoute } from "next"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://n3urali.com"

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The "setAll" method was called from a Server Component.
          }
        },
      },
    },
  )

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories/equirectangular`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories/fisheye`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ]

  // Get all images for dynamic pages
  const { data: images } = await supabase
    .from("images")
    .select("id, created_at, updated_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  const imagePages =
    images?.map((image) => ({
      url: `${baseUrl}/photo/${image.id}`,
      lastModified: new Date(image.updated_at || image.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })) || []

  return [...staticPages, ...imagePages]
}
