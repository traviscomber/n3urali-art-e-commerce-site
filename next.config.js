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
  onDemandEntries: {
    maxInactiveAge: 1000,
    pagesBufferLength: 2,
  },
  webpack: (config) => {
    // Prevent webpack from using ANY filesystem cache - must use memory only
    // Set cache to false AND disable cacheHandler to prevent PackFileCacheStrategy errors
    config.cache = false
    config.infrastructureLogging = {
      level: 'error',
      debug: ['webpack.cache.PackFileCacheStrategy'], // Suppress the cache warnings
    }
    return config
  },
}

module.exports = nextConfig
