import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'N3uralia360 - Immersive Art & Commerce',
    short_name: 'N3uralia360',
    description: 'Full-dome immersive content, VR environments, and cinematic productions for dome operators and immersive events.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#0066ff',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
    ],
    screenshots: [
      {
        src: '/placeholder.svg',
        sizes: '540x720',
        form_factor: 'narrow',
        type: 'image/svg+xml',
      },
    ],
  }
}
