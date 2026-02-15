'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface FAQ {
  question: string
  answer: string
}

interface ContactFAQBlockProps {
  faqs: FAQ[]
}

export function ContactFAQBlock({ faqs }: ContactFAQBlockProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 border-t border-gray-800">
      <div className="space-y-8">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`faq-${idx}`}
              className="border border-gray-800 rounded-lg px-6"
            >
              <AccordionTrigger className="text-foreground hover:text-gray-300 transition-colors py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-400 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
