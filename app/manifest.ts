import type { MetadataRoute } from 'next'

// This route prevents Next.js 16 Turbopack from auto-detecting and creating conflicting manifest routes
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'N3uralia360',
    short_name: 'N3uralia360',
    description: 'Cultural immersive media studio',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [],
  }
}
