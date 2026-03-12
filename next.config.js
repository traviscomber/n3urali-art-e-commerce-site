/** @type {import('next').NextConfig} */
const path = require('path')

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
    // Set webpack cache to filesystem with ABSOLUTE path for production builds
    config.cache = {
      type: 'filesystem',
      cacheDirectory: path.resolve('.next/cache/webpack'),
      buildDependencies: {
        config: [__filename],
      },
    }
    return config
  },
}

module.exports = nextConfig
