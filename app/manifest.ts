import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'n3uralia360.art - Premium AI-Generated 360° Photography',
    short_name: 'n3uralia360',
    description: 'Premium AI-generated 360° photography marketplace specializing in ultra high-resolution equirectangular and fisheye dome images for VR, projection mapping, and immersive visualization',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['photo', 'graphics', 'art'],
  }
}
