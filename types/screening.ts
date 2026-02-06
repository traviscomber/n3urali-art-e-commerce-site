'use client'

export interface ScreeningProgram {
  id: string
  title: string
  description: string
  mood: string
  audience_type: string
  duration_minutes: number
  work_ids: string[]
  collection_ids: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export type AudienceType = 'children' | 'families' | 'adults' | 'institutions' | 'general'
export type Mood = 'meditative' | 'energetic' | 'narrative' | 'abstract' | 'sacred' | 'immersive'
