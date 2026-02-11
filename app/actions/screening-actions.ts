'use server'

import { createClient } from '@/lib/supabase/server'
import { ScreeningProgram } from '@/types/screening'

export async function getScreeningPrograms(): Promise<ScreeningProgram[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('screening_programs')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[v0] Error fetching screening programs:', error)
    return []
  }

  return data || []
}

export async function getScreeningProgramById(id: string): Promise<ScreeningProgram | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('screening_programs')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('[v0] Error fetching screening program:', error)
    return null
  }

  return data
}

export async function getAllScreeningPrograms(): Promise<ScreeningProgram[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('screening_programs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[v0] Error fetching all screening programs:', error)
    return []
  }

  return data || []
}

export async function createScreeningProgram(program: Omit<ScreeningProgram, 'id' | 'created_at' | 'updated_at'>): Promise<ScreeningProgram | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('screening_programs')
    .insert([program])
    .select()
    .single()

  if (error) {
    console.error('[v0] Error creating screening program:', error)
    return null
  }

  return data
}

export async function updateScreeningProgram(id: string, updates: Partial<ScreeningProgram>): Promise<ScreeningProgram | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('screening_programs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[v0] Error updating screening program:', error)
    return null
  }

  return data
}

export async function deleteScreeningProgram(id: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('screening_programs')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[v0] Error deleting screening program:', error)
    return false
  }

  return true
}
