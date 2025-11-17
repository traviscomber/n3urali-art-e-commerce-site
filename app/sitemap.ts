import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://n3uralia360.art'
  
  const supabase = await createClient()
  
  // Get all active images
  const { data: images } = await supabase
    .from('images')
    .select('id, updated_at')
    .eq('active', true)
    .order('updated_at', { ascending: false })
  
  // Get all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('name')
    .order('name')
  
  // Static pages
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collection`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/licensing-contract`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]
  
  // Add image detail pages
  const imageRoutes = (images || []).map((image) => ({
    url: `${baseUrl}/photo/${image.id}`,
    lastModified: new Date(image.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))
  
  // Add category pages
  const categoryRoutes = (categories || []).map((category) => ({
    url: `${baseUrl}/gallery?category=${encodeURIComponent(category.name)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))
  
  return [...routes, ...imageRoutes, ...categoryRoutes]
}
