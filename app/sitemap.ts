import { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://n3uralia360.art'
  
  try {
    const supabase = createAdminClient()
    
    // Get all active images
    const { data: images } = await supabase
      .from('images')
      .select('id, updated_at')
      .eq('active', true)
      .order('updated_at', { ascending: false })
      .limit(5000) // Sitemap limit
    
    // Get all collections
    const { data: collections } = await supabase
      .from('collections')
      .select('code, updated_at')
      .order('updated_at', { ascending: false })
    
    // Static pages - organized by priority for SEO
    const staticPages = [
      // Homepage - highest priority
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      // Primary galleries
      {
        url: `${baseUrl}/gallery`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.95,
      },
      {
        url: `${baseUrl}/browse`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.95,
      },
      {
        url: `${baseUrl}/shop`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/all`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      // Categories
      {
        url: `${baseUrl}/categories/equirectangular`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.85,
      },
      {
        url: `${baseUrl}/categories/fisheye`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.85,
      },
      // Collections
      {
        url: `${baseUrl}/collection`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      // Content pages
      {
        url: `${baseUrl}/shows`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      },
      {
        url: `${baseUrl}/environments`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      },
      // Environment detail pages - Mythical, Art, Culture, Nature
      {
        url: `${baseUrl}/environments/mythical`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.80,
      },
      {
        url: `${baseUrl}/environments/art`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.80,
      },
      {
        url: `${baseUrl}/environments/culture`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.80,
      },
      {
        url: `${baseUrl}/environments/nature`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.80,
      },
      {
        url: `${baseUrl}/theatre`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/theatre/all`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/works`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/realities`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      // Information pages
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.75,
      },
      {
        url: `${baseUrl}/studio`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.75,
      },
      {
        url: `${baseUrl}/studio/process`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/commission`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.75,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      // Legal/Terms
      {
        url: `${baseUrl}/licensing-terms`,
        lastModified: new Date(),
        changeFrequency: 'yearly' as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/licensing-contract`,
        lastModified: new Date(),
        changeFrequency: 'yearly' as const,
        priority: 0.5,
      },
      // Auth pages (for completeness)
      {
        url: `${baseUrl}/auth/login`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/auth/register`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
    ]
    
    // Add image detail pages - dynamic from database
    const imageRoutes = (images || []).map((image) => ({
      url: `${baseUrl}/photo/${image.id}`,
      lastModified: new Date(image.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
    
    // Add collection pages - dynamic from database
    const collectionRoutes = (collections || []).map((collection) => ({
      url: `${baseUrl}/collection/${collection.code}`,
      lastModified: new Date(collection.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
    
    return [...staticPages, ...collectionRoutes, ...imageRoutes]
  } catch (error) {
    console.error('[v0] Sitemap generation error:', error)
    // Return at least static routes on error
    return [
      {
        url: 'https://n3uralia360.art',
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      {
        url: 'https://n3uralia360.art/gallery',
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.95,
      },
      {
        url: 'https://n3uralia360.art/browse',
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.95,
      },
      {
        url: 'https://n3uralia360.art/shop',
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
    ]
  }
}
