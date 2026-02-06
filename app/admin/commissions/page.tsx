'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mail, MapPin, Calendar, User, Briefcase, DollarSign, Clock } from 'lucide-react'

const supabase = createClient()

interface Commission {
  id: string
  organization_name: string
  contact_name: string
  contact_email: string
  contact_phone?: string
  project_brief: string
  venue_type: string
  audience_demographics?: string
  event_date?: string
  budget_range: string
  timeline: string
  status: 'new' | 'reviewing' | 'contacted' | 'in-progress' | 'completed'
  created_at: string
}

export default function CommissionsAdminPage() {
  const { user } = useAuth()
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('new')
  const [searchQuery, setSearchQuery] = useState('')
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        setSupabase(createClient())
      }
    } catch (error) {
      console.error("[v0] Failed to create Supabase client:", error)
    }
  }, [])

  useEffect(() => {
    if (!supabase) return
    // Redirect if not admin
    if (user?.email !== 'travis@nuanu.com') {
      window.location.href = '/'
      return
    }

    loadCommissions()
  }, [user, supabase])

  const loadCommissions = async () => {
    try {
      const { data, error } = await supabase
        .from('commissions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCommissions(data || [])
    } catch (error) {
      console.error('[v0] Failed to load commissions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateCommissionStatus = async (id: string, newStatus: Commission['status']) => {
    try {
      const { error } = await supabase
        .from('commissions')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      setCommissions(commissions.map(c => c.id === id ? { ...c, status: newStatus } : c))
    } catch (error) {
      console.error('[v0] Failed to update commission:', error)
    }
  }

  const filteredCommissions = commissions.filter(c => {
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus
    const matchesSearch = searchQuery === '' || 
      c.organization_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contact_email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const statusCounts = {
    new: commissions.filter(c => c.status === 'new').length,
    reviewing: commissions.filter(c => c.status === 'reviewing').length,
    contacted: commissions.filter(c => c.status === 'contacted').length,
    'in-progress': commissions.filter(c => c.status === 'in-progress').length,
    completed: commissions.filter(c => c.status === 'completed').length,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading commissions...</p>
        </div>
      </div>
    )
  }

  if (user?.email !== 'travis@nuanu.com') {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Commission Management</h1>
          <p className="text-muted-foreground">Manage institutional commission inquiries</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search by organization, contact name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Status Tabs */}
        <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All ({commissions.length})</TabsTrigger>
            <TabsTrigger value="new">New ({statusCounts.new})</TabsTrigger>
            <TabsTrigger value="reviewing">Reviewing ({statusCounts.reviewing})</TabsTrigger>
            <TabsTrigger value="contacted">Contacted ({statusCounts.contacted})</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress ({statusCounts['in-progress']})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({statusCounts.completed})</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedStatus} className="space-y-4 mt-6">
            {filteredCommissions.length > 0 ? (
              filteredCommissions.map((commission) => (
                <Card key={commission.id} className="p-6 hover:border-primary transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    {/* Organization Info */}
                    <div>
                      <h3 className="font-bold text-lg mb-3">{commission.organization_name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>{commission.contact_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <a href={`mailto:${commission.contact_email}`} className="hover:text-primary">
                            {commission.contact_email}
                          </a>
                        </div>
                        {commission.contact_phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span>☎</span>
                            <a href={`tel:${commission.contact_phone}`} className="hover:text-primary">
                              {commission.contact_phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Project Details */}
                    <div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{commission.venue_type}</span>
                        </div>
                        {commission.event_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{commission.event_date}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{commission.budget_range}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{commission.timeline}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Brief */}
                  <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Project Brief</p>
                    <p className="text-sm text-muted-foreground line-clamp-3">{commission.project_brief}</p>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={commission.status === 'new' ? 'default' : 'outline'}>
                        {commission.status}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      {commission.status !== 'reviewing' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCommissionStatus(commission.id, 'reviewing')}
                        >
                          Review
                        </Button>
                      )}
                      {commission.status !== 'contacted' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCommissionStatus(commission.id, 'contacted')}
                        >
                          Mark Contacted
                        </Button>
                      )}
                      {commission.status !== 'in-progress' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCommissionStatus(commission.id, 'in-progress')}
                        >
                          In Progress
                        </Button>
                      )}
                      {commission.status !== 'completed' && (
                        <Button
                          size="sm"
                          onClick={() => updateCommissionStatus(commission.id, 'completed')}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                    <span>Submitted: {new Date(commission.created_at).toLocaleDateString()}</span>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No commissions found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
