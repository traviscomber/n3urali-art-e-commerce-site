/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '**.backblazeb2.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
    minimumCacheTTL: 31536000,
  },
  compress: true,
  webpack: (config, { isServer }) => {
    // Use memory cache only - no filesystem cache to avoid stale cache path issues
    config.cache = {
      type: 'memory'
    }
    return config
  },
}

module.exports = nextConfig
