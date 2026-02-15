'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ContactFormBlockProps {
  onSubmit?: (data: any) => void
}

export function ContactFormBlock({ onSubmit }: ContactFormBlockProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setStatus('success')
        e.currentTarget.reset()
        setTimeout(() => setStatus('idle'), 3000)
      } else {
        setStatus('error')
      }
    } catch (error) {
      setStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 border-t border-gray-800">
      <div className="max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
          Send us a Message
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 focus:border-gray-700 focus:outline-none text-foreground placeholder-gray-500 transition-colors"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 focus:border-gray-700 focus:outline-none text-foreground placeholder-gray-500 transition-colors"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 focus:border-gray-700 focus:outline-none text-foreground placeholder-gray-500 transition-colors resize-none"
              placeholder="Tell us about your project..."
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Sending...' : 'Send Message'}
          </Button>

          {status === 'success' && (
            <p className="text-green-500 text-sm">Message sent successfully!</p>
          )}
          {status === 'error' && (
            <p className="text-red-500 text-sm">Failed to send message. Please try again.</p>
          )}
        </form>
      </div>
    </section>
  )
}
