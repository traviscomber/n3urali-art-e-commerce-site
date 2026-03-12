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
  webpack: (config, { dir }) => {
    // Force webpack cache to use current project directory with absolute path
    // This prevents webpack from trying to access the old project path
    config.cache = {
      type: 'filesystem',
      cacheDirectory: path.join(dir, '.next', 'cache', 'webpack'),
      name: 'client-webpack-cache',
    }
    config.infrastructureLogging = { level: 'none' }
    return config
  },
}

module.exports = nextConfig
