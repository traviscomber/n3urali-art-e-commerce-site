export interface Work {
  id: string
  work_title: string
  synopsis?: string
  cultural_inspiration?: string
  audience_type?: 'all' | 'children' | 'adults' | 'institutional'
  format_types?: string[]
  collection_id: string
  created_at: string
  updated_at: string
  image_count: number
  formats: {
    dome: number
    vr: number
    loop: number
    social: number
  }
}

export interface WorkDetail extends Work {
  images: {
    id: string
    title: string
    thumbnail_medium_url: string
    image_format: 'equirectangular' | 'fisheye'
    format_edition?: string
  }[]
}

export interface WorksListResponse {
  works: Work[]
  total: number
}
