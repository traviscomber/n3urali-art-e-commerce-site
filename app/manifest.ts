import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'N3uralia360 - Immersive Worlds. Cultural Stories.',
    short_name: 'N3uralia360',
    description: 'A cultural immersive media studio creating experiences across dome installations, VR environments, performance loops, and spatial media.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    orientation: 'portrait-primary',
    scope: '/',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable any',
      },
    ],
    categories: ['art', 'media', 'entertainment'],
    screenshots: [
      {
        src: '/screenshot-1280x720.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide' as const,
      },
    ],
  }
}
