'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/contexts/language-context'

export function ContactPageClient() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [leadId, setLeadId] = useState<number | null>(null)

  const options = [
    t('contact.option1'),
    t('contact.option2'),
    t('contact.option3'),
    t('contact.option4'),
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
        const nextCount = parseInt(storedLeadCount || '0') + 1
        const nextLeadId = nextCount.toString().padStart(3, '0')
        localStorage.setItem('leadCount', nextCount.toString())
        
        setLeadId(nextCount)
        setSubmitSuccess(true)
        setEmail('')
        setMessage('')
        setSelectedOptions([])
        // Keep form locked and modal visible for 8 seconds, then auto-close
        setTimeout(() => {
          setSubmitSuccess(false)
        }, 8000)
      } else {
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Submission error:', error)
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
      <div className="w-full px-4 sm:px-12 md:px-16 lg:px-20 py-8 sm:py-12 ">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/" className="text-slate-400 hover:text-cyan-400 transition-colors text-xs sm:text-sm font-light">
            {t('contact.back')}
          </Link>
          <span className="text-slate-700">|</span>
          <h1 className="text-cyan-400 text-xs sm:text-sm font-light">{t('contact.formTitle')}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-12 md:px-16 lg:px-20 py-12 sm:py-16">
        {/* Section Title */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-slate-100 mb-12 sm:mb-16">
          {t('contact.sectionTitle')}
        </h2>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
          {/* Left Column - WhatsApp */}
          <div className="bg-slate-900/50 rounded-lg p-8 sm:p-12 border border-slate-800 flex flex-col justify-between min-h-[300px]">
            <div>
              <h3 className="text-2xl sm:text-3xl font-light text-slate-100 mb-4">{t('contact.whatsappTitle')}</h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                {t('contact.whatsappDescription')}
              </p>
            </div>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-6 py-3 border border-black bg-black text-slate-300 text-sm font-medium hover:bg-slate-900 transition-colors text-center mt-8"
            >
              {t('contact.contactNow')}
            </a>
          </div>

          {/* Right Column - Email Form */}
          <div className="bg-slate-900/50 rounded-lg p-8 sm:p-12 border border-slate-800">
            <h3 className="text-2xl sm:text-3xl font-light text-slate-100 mb-8">{t('contact.emailTitle')}</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="text-slate-400 text-xs font-medium mb-2 block">{t('contact.emailLabel')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('contact.emailPlaceholder')}
                  className="w-full bg-transparent border border-slate-700 text-slate-300 px-4 py-2 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                  required
                />
              </div>

              {/* Checkboxes */}
              <div>
                <label className="text-slate-400 text-xs font-medium mb-4 block">{t('contact.chooseOptions')}</label>
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
                <label className="text-slate-400 text-xs font-medium mb-2 block">{t('contact.messageLabel')}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('contact.messagePlaceholder')}
                  className="w-full bg-transparent border border-slate-700 text-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-colors resize-none h-28"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!email || selectedOptions.length === 0 || isSubmitting}
                className="w-full px-6 py-3 mt-8 bg-slate-600 text-white font-medium hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
              >
                {isSubmitting ? t('contact.submitting') : t('contact.submitButton')}
              </button>

              {/* Success Modal - Captivating Message */}
              {submitSuccess && leadId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-slate-900 border border-cyan-400/50 rounded-lg p-8 max-w-md mx-4 text-center space-y-4 animate-in fade-in zoom-in">
                    <div className="text-5xl">🌟</div>
                    <div>
                      <h3 className="text-xl font-light text-slate-100 mb-3">
                        {t('contact.successTitle')}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {t('contact.successMessage')}
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
                      {t('contact.close')}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 sm:mt-24">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-slate-100 mb-12 sm:mb-16">
            {t('contact.faqTitle')}
          </h2>
          <div className="space-y-6">
            <details className="group border border-slate-700 rounded-lg p-6 sm:p-8 hover:border-cyan-400/50 transition-colors">
              <summary className="flex cursor-pointer items-center justify-between font-light text-lg sm:text-xl text-slate-100">
                {t('contact.faq1Question')}
                <span className="transition group-open:rotate-180 text-cyan-400">▼</span>
              </summary>
              <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
                {t('contact.faq1Answer')}
              </p>
            </details>

            <details className="group border border-slate-700 rounded-lg p-6 sm:p-8 hover:border-cyan-400/50 transition-colors">
              <summary className="flex cursor-pointer items-center justify-between font-light text-lg sm:text-xl text-slate-100">
                {t('contact.faq2Question')}
                <span className="transition group-open:rotate-180 text-cyan-400">▼</span>
              </summary>
              <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
                {t('contact.faq2Answer')}
              </p>
            </details>

            <details className="group border border-slate-700 rounded-lg p-6 sm:p-8 hover:border-cyan-400/50 transition-colors">
              <summary className="flex cursor-pointer items-center justify-between font-light text-lg sm:text-xl text-slate-100">
                {t('contact.faq3Question')}
                <span className="transition group-open:rotate-180 text-cyan-400">▼</span>
              </summary>
              <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
                {t('contact.faq3Answer')}
              </p>
            </details>

            <details className="group border border-slate-700 rounded-lg p-6 sm:p-8 hover:border-cyan-400/50 transition-colors">
              <summary className="flex cursor-pointer items-center justify-between font-light text-lg sm:text-xl text-slate-100">
                {t('contact.faq4Question')}
                <span className="transition group-open:rotate-180 text-cyan-400">▼</span>
              </summary>
              <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
                {t('contact.faq4Answer')}
              </p>
            </details>

            <details className="group border border-slate-700 rounded-lg p-6 sm:p-8 hover:border-cyan-400/50 transition-colors">
              <summary className="flex cursor-pointer items-center justify-between font-light text-lg sm:text-xl text-slate-100">
                {t('contact.faq5Question')}
                <span className="transition group-open:rotate-180 text-cyan-400">▼</span>
              </summary>
              <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
                {t('contact.faq5Answer')}
              </p>
            </details>
          </div>
        </div>
  )
}
