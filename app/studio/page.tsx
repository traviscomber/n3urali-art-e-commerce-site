import type { Metadata } from 'next'
import { StudioPageClient } from '@/components/studio-page-client'

export const metadata: Metadata = {
  title: 'Studio - N3uralia360',
  description: 'N3uralia360 is a content creation studio combining advanced proprietary AI tools with human art direction and real production.',
}

export const revalidate = 3600

export default function StudioPage() {
  return (
    <main className="min-h-screen w-full bg-black">
      <StudioPageClient />
    </main>
  )
}
