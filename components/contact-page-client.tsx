'use client'

import { useState } from 'react'
import Link from 'next/link'

export function ContactPageClient() {
  const [email, setEmail] = useState('')
  const [checked, setChecked] = useState({
    demo: false,
    episode: false,
    catalogue: false,
    custom: false,
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleCheckboxChange = (key: string) => {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email')
      return
    }

    const hasChecked = Object.values(checked).some(v => v)
    if (!hasChecked) {
      setError('Please select at least one option')
      return
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          interests: Object.keys(checked).filter(k => checked[k as keyof typeof checked]),
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        setEmail('')
        setChecked({ demo: false, episode: false, catalogue: false, custom: false })
        setTimeout(() => setSubmitted(false), 3000)
      } else {
        setError('Failed to send. Please try again.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    }
  }

  const whatsappUrl = `https://wa.me/6282340137013?text=${encodeURIComponent('Hi, I\'m interested in N3uralia360 immersive dome products and would like more information.')}`

  return (
    <main className="w-full min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-slate-700 px-6 sm:px-16 md:px-24 lg:px-32 py-8 sm:py-12">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-500 hover:text-slate-300 transition-colors text-sm">
            Back
          </Link>
          <div className="text-slate-500">|</div>
          <h1 className="text-slate-100 text-lg sm:text-2xl font-light">Contact Form</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 sm:px-16 md:px-24 lg:px-32 py-12 sm:py-20">
        {/* Heading */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-slate-100 mb-12 sm:mb-16">
          Submit Fast Inquiry
        </h2>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: WhatsApp Section */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl sm:text-3xl font-light text-slate-100 mb-4">WhatsApp</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Contact us and we will reply within few hours
              </p>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 px-6 py-3 bg-black border border-slate-700 text-slate-300 hover:border-cyan-400 hover:text-cyan-400 transition-colors text-center font-light"
            >
              Contact Now
            </a>
          </div>

          {/* Right: Email Form Section */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-8 sm:p-10">
            <h3 className="text-2xl sm:text-3xl font-light text-slate-100 mb-6">Email</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="text-slate-400 text-xs sm:text-sm mb-2 block">Your Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-black border border-slate-700 text-slate-100 px-4 py-2 text-sm focus:outline-none focus:border-cyan-400 transition-colors placeholder-slate-600"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest opacity-80">Inquiry Type:</p>

                {[
                  { id: 'demo', label: 'I\'d like to test a demo in my dome' },
                  { id: 'episode', label: 'I\'m interested in watching a full episode' },
                  { id: 'catalogue', label: 'Send me the complete catalogue' },
                  { id: 'custom', label: 'I want to commission a custom show' },
                ].map(option => (
                  <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked[option.id as keyof typeof checked]}
                      onChange={() => handleCheckboxChange(option.id)}
                      className="w-4 h-4 rounded border-slate-600 text-cyan-400"
                    />
                    <span className="text-slate-300 text-xs sm:text-sm">{option.label}</span>
                  </label>
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-red-400 text-xs sm:text-sm">{error}</p>
              )}

              {/* Success Message */}
              {submitted && (
                <p className="text-cyan-400 text-xs sm:text-sm">Thank you! We'll be in touch soon.</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-6 py-3 bg-black border border-slate-700 text-slate-300 hover:border-cyan-400 hover:text-cyan-400 transition-colors font-light text-sm"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
