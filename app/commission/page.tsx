'use client'

import React from "react"

import { useState } from 'react'
import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export default function CommissionPage() {
  const [formData, setFormData] = useState({
    organization: '',
    name: '',
    email: '',
    phone: '',
    briefDescription: '',
    venue: '',
    targetAudience: '',
    budget: '',
    timeline: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/commission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitted(true)
        setFormData({
          organization: '',
          name: '',
          email: '',
          phone: '',
          briefDescription: '',
          venue: '',
          targetAudience: '',
          budget: '',
          timeline: '',
        })
      }
    } catch (error) {
      console.error('Failed to submit commission:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Commission an Immersive Work</h1>
          <p className="text-xl text-muted-foreground text-pretty">
            Tell us about your vision. We'll create an immersive experience uniquely suited to your venue and audience.
          </p>
        </div>

        {submitted ? (
          <Card className="p-8 text-center bg-primary/5 border-primary/20">
            <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
            <p className="text-muted-foreground mb-6">
              We've received your commission inquiry. Our team will review your brief and contact you within 48 hours to discuss your project.
            </p>
            <Button onClick={() => setSubmitted(false)}>Submit Another Inquiry</Button>
          </Card>
        ) : (
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Organization */}
              <div>
                <Label htmlFor="organization">Organization / Institution</Label>
                <Input
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="Your organization name"
                  required
                />
              </div>

              {/* Contact Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Contact Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              {/* Brief Description */}
              <div>
                <Label htmlFor="briefDescription">Project Brief</Label>
                <textarea
                  id="briefDescription"
                  name="briefDescription"
                  value={formData.briefDescription}
                  onChange={handleChange}
                  placeholder="Describe your vision, cultural inspiration, and goals for this immersive work..."
                  className="w-full p-3 border border-input rounded-md bg-background text-foreground resize-none"
                  rows={5}
                  required
                />
              </div>

              {/* Venue */}
              <div>
                <Label htmlFor="venue">Intended Venue / Format</Label>
                <select
                  id="venue"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  className="w-full p-2 border border-input rounded-md bg-background text-foreground"
                  required
                >
                  <option value="">Select venue type...</option>
                  <option value="planetarium">Planetarium / Dome Theater</option>
                  <option value="vr">VR Installation</option>
                  <option value="museum">Museum Exhibition</option>
                  <option value="cultural-center">Cultural Center</option>
                  <option value="performance">Live Performance Venue</option>
                  <option value="broadcast">Broadcast / Media</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Target Audience */}
              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <select
                  id="targetAudience"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleChange}
                  className="w-full p-2 border border-input rounded-md bg-background text-foreground"
                  required
                >
                  <option value="">Select audience...</option>
                  <option value="all-ages">All Ages</option>
                  <option value="children">Children</option>
                  <option value="adults">Adults</option>
                  <option value="institutional">Institutional / Professional</option>
                </select>
              </div>

              {/* Budget & Timeline */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget">Budget Range</Label>
                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full p-2 border border-input rounded-md bg-background text-foreground"
                    required
                  >
                    <option value="">Select budget...</option>
                    <option value="under-50k">Under $50K</option>
                    <option value="50k-100k">$50K - $100K</option>
                    <option value="100k-250k">$100K - $250K</option>
                    <option value="250k-plus">$250K+</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="timeline">Timeline</Label>
                  <select
                    id="timeline"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    className="w-full p-2 border border-input rounded-md bg-background text-foreground"
                    required
                  >
                    <option value="">Select timeline...</option>
                    <option value="3-months">3 Months</option>
                    <option value="6-months">6 Months</option>
                    <option value="12-months">12 Months</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Commission Request'}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                We'll review your brief and respond within 48 hours with next steps and a custom proposal.
              </p>
            </form>
          </Card>
        )}
      </div>
    </main>
  )
}
