'use client'

import { useState } from 'react'
import Link from 'next/link'

export function ContactPageClient() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [leadId, setLeadId] = useState<number | null>(null)

  const options = [
    'I would like to see a demo in my dome',
    'I am interested in watching a full episode',
    'Send me the complete catalogue',
    'I want to commission a custom show',
  ]

  const handleOptionChange = (option: string) => {
    setSelectedOptions(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || selectedOptions.length === 0) return

    setIsSubmitting(true)
    try {
      // Send to email service
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          message,
          interests: selectedOptions.join(', '),
        }),
      })

      if (response.ok) {
        // Generate sequential lead ID from localStorage
        const storedLeadCount = localStorage.getItem('leadCount')
        const nextLeadId = (parseInt(storedLeadCount || '0') + 1).toString().padStart(3, '0')
        localStorage.setItem('leadCount', nextLeadId)
        
        setLeadId(nextLeadId)
        setSubmitSuccess(true)
        setIsSubmitting(true)
        setEmail('')
        setMessage('')
        setSelectedOptions([])
        setTimeout(() => {
          setSubmitSuccess(false)
          setIsSubmitting(false)
        }, 5000)
      }
    } catch (error) {
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const whatsappMessage = encodeURIComponent(
    "Hi, I'm interested in N3uralia360 immersive dome products and would like more information."
  )
  const whatsappLink = `https://wa.me/6282340137013?text=${whatsappMessage}`

  return (
    <main className="w-full min-h-screen bg-black">
      {/* Header Navigation */}
      <div className="w-full px-4 sm:px-8 lg:px-12 py-8 sm:py-12 border-b border-slate-700">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/" className="text-slate-400 hover:text-cyan-400 transition-colors text-xs sm:text-sm font-light">
            Back
          </Link>
          <span className="text-slate-700">|</span>
          <h1 className="text-cyan-400 text-xs sm:text-sm font-light">Contact Form</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-16">
        {/* Section Title */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-slate-100 mb-12 sm:mb-16">
          Submit Fast Inquiry
        </h2>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
          {/* Left Column - WhatsApp */}
          <div className="bg-slate-900/50 rounded-lg p-8 sm:p-12 border border-slate-800 flex flex-col justify-between min-h-[300px]">
            <div>
              <h3 className="text-2xl sm:text-3xl font-light text-slate-100 mb-4">WhatsApp</h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Contact us and we will reply within few hours
              </p>
            </div>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-6 py-3 border border-black bg-black text-slate-300 text-sm font-medium hover:bg-slate-900 transition-colors text-center mt-8"
            >
              Contact Now
            </a>
          </div>

          {/* Right Column - Email Form */}
          <div className="bg-slate-900/50 rounded-lg p-8 sm:p-12 border border-slate-800">
            <h3 className="text-2xl sm:text-3xl font-light text-slate-100 mb-8">Email</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="text-slate-400 text-xs font-medium mb-2 block">Your Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-transparent border border-slate-700 text-slate-300 px-4 py-2 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                  required
                />
              </div>

              {/* Checkboxes */}
              <div>
                <label className="text-slate-400 text-xs font-medium mb-4 block">Choose one or more:</label>
                <div className="space-y-3">
                  {options.map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedOptions.includes(option)}
                        onChange={() => handleOptionChange(option)}
                        className="w-4 h-4 accent-cyan-400 cursor-pointer"
                      />
                      <span className="text-slate-300 text-xs sm:text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Message Textarea */}
              <div>
                <label className="text-slate-400 text-xs font-medium mb-2 block">Tell us what you need (Optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share any details about your project or requirements..."
                  className="w-full bg-transparent border border-slate-700 text-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-colors resize-none h-28"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!email || selectedOptions.length === 0 || isSubmitting}
                className="w-full px-6 py-3 border border-cyan-400 text-cyan-400 text-sm font-medium hover:bg-cyan-400/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>

              {/* Success Modal - Captivating Message */}
              {submitSuccess && leadId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-slate-900 border border-cyan-400/50 rounded-lg p-8 max-w-md mx-4 text-center space-y-4 animate-in fade-in zoom-in">
                    <div className="text-5xl">🌟</div>
                    <div>
                      <h3 className="text-xl font-light text-slate-100 mb-3">
                        Your vision is on its way!
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        Thank you for reaching out. We're excited to explore what's possible for your immersive experience. Our team will connect with you shortly to bring your ideas to life.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSubmitSuccess(false)
                        setIsSubmitting(false)
                        setLeadId(null)
                      }}
                      className="mt-6 px-6 py-2 border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 transition-colors text-sm font-medium rounded"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
