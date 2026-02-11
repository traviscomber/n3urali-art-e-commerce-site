'use server'

import { createClient } from '@/lib/supabase/server'
import type { Work, WorkDetail, WorksListResponse } from '@/types/works'

/**
 * Get all Works with pagination
 */
export async function getWorks(
  limit = 12,
  offset = 0,
  audience?: string,
): Promise<WorksListResponse> {
  const supabase = await createClient()

  try {
    let query = supabase
      .from('works_view')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (audience && audience !== 'all') {
      query = query.eq('audience_type', audience)
    }

    const { data, count, error } = await query

    if (error) throw error

    return {
      works: (data as Work[]) || [],
      total: count || 0,
    }
  } catch (error) {
    console.error('[v0] Failed to fetch Works:', error)
    return { works: [], total: 0 }
  }
}

/**
 * Get a single Work with all related images
 */
export async function getWorkDetail(workId: string): Promise<WorkDetail | null> {
  const supabase = await createClient()

  try {
    // Get work metadata
    const { data: work, error: workError } = await supabase
      .from('works_view')
      .select('*')
      .eq('id', workId)
      .single()

    if (workError) throw workError
    if (!work) return null

    // Get related images
    const { data: images, error: imagesError } = await supabase
      .from('images')
      .select('id, title, thumbnail_medium_url, image_format, format_edition')
      .eq('work_id', workId)
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (imagesError) throw imagesError

    return {
      ...(work as Work),
      images: images || [],
    }
  } catch (error) {
    console.error('[v0] Failed to fetch Work detail:', error)
    return null
  }
}

/**
 * Get Works filtered by audience type
 */
export async function getWorksByAudience(
  audience: 'all' | 'children' | 'adults' | 'institutional',
): Promise<Work[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('works_view')
      .select('*')
      .eq('audience_type', audience)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return (data as Work[]) || []
  } catch (error) {
    console.error('[v0] Failed to fetch Works by audience:', error)
    return []
  }
}

/**
 * Get Works by region (ASEAN, South America, etc.)
 */
export async function getWorksByRegion(region: string): Promise<Work[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('works_view')
      .select('*')
      .ilike('cultural_inspiration', `%${region}%`)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data as Work[]) || []
  } catch (error) {
    console.error('[v0] Failed to fetch Works by region:', error)
    return []
  }
}
