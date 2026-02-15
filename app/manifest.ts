import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'N3uralia360 - Immersive Worlds. Cultural Stories.',
    short_name: 'N3uralia360',
    description: 'Cultural immersive media studio creating experiences across dome installations, VR environments, performance loops, and spatial media.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    orientation: 'portrait',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
        purpose: 'any',
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    screenshots: [
      {
        src: '/images/n3uralia-logo.png',
        sizes: '512x512',
        type: 'image/png',
        form_factor: 'wide',
      },
    ],
  }
}
