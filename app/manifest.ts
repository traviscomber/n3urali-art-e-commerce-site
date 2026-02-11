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
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  }
}
