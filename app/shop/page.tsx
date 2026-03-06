import { Metadata } from 'next'
import { ShopClient } from '@/components/shop-client'

export const metadata: Metadata = {
  title: 'N3uralia Shop | Premium Dome Environments',
  description: 'Browse and purchase premium immersive environments for dome theaters, planetariums, and immersive displays. High-resolution, projection-ready content.',
  keywords: 'dome environments, immersive content, planetarium software, 360 video, immersive theater',
}

export default function ShopPage() {
  return (
    <main className="w-full bg-black min-h-screen">
      <ShopClient />
    </main>
  )
}
