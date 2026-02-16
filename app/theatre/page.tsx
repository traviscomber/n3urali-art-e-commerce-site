import type { Metadata } from 'next'
import { TheatrePlayer } from '@/components/theatre-player'

export const metadata: Metadata = {
  title: 'Theatre - N3uralia360',
  description: 'Immersive video experiences in categories including Immersive Worlds, Cultural Journeys, and Digital Art.',
}

export const revalidate = 3600

export default async function TheatrePage() {
  return (
    <main className="min-h-screen w-full bg-black">
      <TheatrePlayer />
    </main>
  )
}
