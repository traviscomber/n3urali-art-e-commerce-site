import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'n3uralia360.art - Premium AI-Generated 360° Photography',
    short_name: 'n3uralia360',
    description: 'Ultra high-resolution equirectangular and fisheye dome images for VR, projection mapping, and immersive experiences',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    theme_color: '#000000',
    background_color: '#0f172a',
    categories: ['photography', 'graphics', 'utilities'],
    screenshots: [
      {
        src: '/og-image.jpg',
        sizes: '1200x630',
        type: 'image/jpeg',
        form_factor: 'wide',
      },
      {
        src: '/og-image-square.jpg',
        sizes: '1200x1200',
        type: 'image/jpeg',
        form_factor: 'narrow',
      },
    ],
    icons: [
      {
        src: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  }
}
