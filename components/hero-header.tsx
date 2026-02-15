'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/contexts/language-context'

export function HeroHeader() {
  const { t } = useLanguage()

  const sections = [
    { label: 'Studio', href: '/studio', icon: '◆' },
    { label: 'Environments', href: '/environments', icon: '▬' },
    { label: 'Realities', href: '/realities', icon: '●' },
    { label: 'Theatre', href: '/theatre', icon: '▲' },
  ]

  return (
    <header className="w-full border-b border-border/30 bg-background/80 backdrop-blur-sm">
      <nav className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-8">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            n3uralia360
          </Link>
          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            {sections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="group flex items-center gap-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
              >
                <span className="text-foreground/40 group-hover:text-foreground/60">{section.icon}</span>
                {section.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}
