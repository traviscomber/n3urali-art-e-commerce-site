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
    // Force webpack cache to false - prevents PackFileCacheStrategy from using corrupted old project cache
    config.cache = false
    config.infrastructureLogging = { level: 'none' }
    return config
  },
}

module.exports = nextConfig
