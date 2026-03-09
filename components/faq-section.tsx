"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    question: "What are N3uralia360 environments?",
    answer: "N3uralia360 environments are immersive 360-degree visual experiences designed for dome installations, VR headsets, planetariums, and projection mapping. Each environment is crafted with cultural research and artistic vision."
  },
  {
    question: "Can I use these environments for commercial purposes?",
    answer: "Yes! We offer multiple licensing options for commercial use. Visit our licensing page or contact us via WhatsApp to discuss your specific needs and project requirements."
  },
  {
    question: "What file formats are available?",
    answer: "Our environments are available in equirectangular format (2:1 aspect ratio) suitable for 360° viewing, as well as optimized versions for VR, dome projection, and other spatial media formats."
  },
  {
    question: "Do you offer custom environment creation?",
    answer: "Absolutely! We specialize in bespoke immersive experiences. Contact us via WhatsApp or email at info@n3uralia360.art to discuss your custom project requirements."
  },
  {
    question: "How do I get access to the free demo?",
    answer: "Click the 'Free Demo' button on our homepage, which will connect you directly via WhatsApp. We'll provide you with demo access and discuss your project needs."
  },
  {
    question: "What are your payment and delivery terms?",
    answer: "We accept multiple payment methods and typically deliver digital files within 24-48 hours of payment. For custom projects, timelines are discussed during the consultation phase."
  },
  {
    question: "Can I download and use environments offline?",
    answer: "Yes, once you've purchased a license, you can download your environments and use them offline according to your specific license terms."
  },
  {
    question: "Do you provide technical support?",
    answer: "Yes! We provide technical support for all licenses. Reach out to us on WhatsApp (+62 823 4013 7013) or email (info@n3uralia360.art) for any implementation questions."
  },
  {
    question: "What makes N3uralia360 unique?",
    answer: "Each environment begins with deep cultural research and unfolds through collaborative artistic vision. We blend technology with cultural storytelling to create truly immersive experiences."
  },
  {
    question: "Can I preview environments before purchasing?",
    answer: "Yes! Click 'View Catalogue' on our homepage to browse and preview available environments in our full interactive gallery."
  }
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-20 bg-gradient-to-b from-black via-slate-900 to-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-slate-300">
            Everything you need to know about N3uralia360 environments
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="border border-slate-700 rounded-lg bg-slate-900/50 hover:bg-slate-900 transition-colors"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left"
              >
                <span className="text-lg font-semibold text-white pr-4">
                  {item.question}
                </span>
                <ChevronDown
                  size={24}
                  className={`text-cyan-400 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Answer */}
              {openIndex === index && (
                <div className="px-6 pb-4 border-t border-slate-700">
                  <p className="text-slate-300 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <p className="text-slate-300 mb-6">
            Didn't find the answer you're looking for?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/6282340137013?text=Hi%20N3uralia360%2C%20I%20have%20a%20question%20about%20your%20environments."
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 transition-colors"
            >
              Ask on WhatsApp
            </a>
            <a
              href="mailto:info@n3uralia360.art"
              className="px-8 py-3 border border-slate-600 text-slate-300 font-semibold rounded-lg hover:border-slate-500 hover:text-white transition-colors"
            >
              Send an Email
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
