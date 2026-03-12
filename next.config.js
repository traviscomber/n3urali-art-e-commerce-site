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
    // Set maxAge to 0 to prevent cache reuse and force fresh builds
    config.cache = {
      type: 'filesystem',
      cacheDirectory: path.join(dir, '.next', 'cache', 'webpack'),
      name: 'client-webpack-cache',
      maxAge: 0, // Disable cache aging to prevent old cache corruption issues
      hashAlgorithm: 'md4',
    }
    config.infrastructureLogging = { level: 'error' } // Only show errors, not warnings
    return config
  },
}

module.exports = nextConfig
