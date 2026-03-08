/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  webpack: (config, { isServer }) => {
    // Optimize webpack cache for large string serialization
    config.cache = {
      type: 'filesystem',
      cacheDirectory: path.resolve(__dirname, '.next/cache'),
      compression: 'gzip',
      hashAlgorithm: 'md4',
      name: 'nextjs-webpack',
      store: 'pack',
      version: '1.0.0',
      maxAge: 1000 * 60 * 60 * 24,
      buildDependencies: {
        config: [__filename],
      },
      managedPaths: isServer ? [path.resolve(__dirname, 'node_modules')] : [],
      immutablePaths: [],
      profile: false,
      readonly: process.env.CI === 'true',
      maxMemoryGenerations: 5,
    }

    return config
  },

  // Image optimization
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
}

module.exports = nextConfig
