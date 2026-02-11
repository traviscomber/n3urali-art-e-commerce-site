'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Trash2, Plus, Edit2, Check, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getAllScreeningPrograms, createScreeningProgram, updateScreeningProgram, deleteScreeningProgram } from '@/app/actions/screening-actions'
import type { ScreeningProgram } from '@/types/screening'

export default function ScreeningProgramsPage() {
  const [programs, setPrograms] = useState<ScreeningProgram[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<ScreeningProgram>>({
    title: '',
    description: '',
    mood: 'immersive',
    audience_type: 'general',
    duration_minutes: 30,
    work_ids: [],
    collection_ids: [],
    is_active: true,
  })

  const loadPrograms = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getAllScreeningPrograms()
      setPrograms(data)
      setError(null)
    } catch (err) {
      console.error('[v0] Error loading programs:', err)
      setError('Failed to load screening programs')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleCreate = async () => {
    if (!formData.title || !formData.description) {
      setError('Title and description are required')
      return
    }

    try {
      const newProgram = await createScreeningProgram(formData as Omit<ScreeningProgram, 'id' | 'created_at' | 'updated_at'>)
      if (newProgram) {
        setPrograms([newProgram, ...programs])
        setFormData({
          title: '',
          description: '',
          mood: 'immersive',
          audience_type: 'general',
          duration_minutes: 30,
          work_ids: [],
          collection_ids: [],
          is_active: true,
        })
        setError(null)
      }
    } catch (err) {
      console.error('[v0] Error creating program:', err)
      setError('Failed to create program')
    }
  }

  const handleUpdate = async (id: string, updates: Partial<ScreeningProgram>) => {
    try {
      const updated = await updateScreeningProgram(id, updates)
      if (updated) {
        setPrograms(programs.map((p) => (p.id === id ? updated : p)))
        setIsEditing(null)
        setError(null)
      }
    } catch (err) {
      console.error('[v0] Error updating program:', err)
      setError('Failed to update program')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return

    try {
      const success = await deleteScreeningProgram(id)
      if (success) {
        setPrograms(programs.filter((p) => p.id !== id))
        setError(null)
      }
    } catch (err) {
      console.error('[v0] Error deleting program:', err)
      setError('Failed to delete program')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p>Loading screening programs...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Screening Programs</h1>
          <p className="text-muted-foreground mt-2">Create and manage curated exhibition programs</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Create New Program</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., ASEAN Legends — Dome Program"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="mood">Mood</Label>
                <select
                  id="mood"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  value={formData.mood || 'immersive'}
                  onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                >
                  <option value="meditative">Meditative</option>
                  <option value="energetic">Energetic</option>
                  <option value="narrative">Narrative</option>
                  <option value="abstract">Abstract</option>
                  <option value="sacred">Sacred</option>
                  <option value="immersive">Immersive</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="Program description and context"
                className="w-full px-3 py-2 border rounded-md bg-background"
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="audience">Audience Type</Label>
                <select
                  id="audience"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  value={formData.audience_type || 'general'}
                  onChange={(e) => setFormData({ ...formData, audience_type: e.target.value })}
                >
                  <option value="children">Children</option>
                  <option value="families">Families</option>
                  <option value="adults">Adults</option>
                  <option value="institutions">Institutions</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="5"
                  max="480"
                  value={formData.duration_minutes || 30}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <Button onClick={handleCreate} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Program
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Active Programs</h2>
          {programs.length === 0 ? (
            <p className="text-muted-foreground">No screening programs created yet</p>
          ) : (
            programs.map((program) => (
              <Card key={program.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{program.title}</CardTitle>
                      <CardDescription>{program.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(program.id)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(program.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Mood:</span>
                      <p className="font-medium capitalize">{program.mood}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Audience:</span>
                      <p className="font-medium capitalize">{program.audience_type}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <p className="font-medium">{program.duration_minutes} min</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <p className="font-medium">{program.is_active ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
