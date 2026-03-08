/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Optimize webpack cache for large string serialization
    config.cache = {
      type: 'filesystem',
      cacheDirectory: '.next/cache',
      compression: 'gzip',
      hashAlgorithm: 'md4',
      name: 'nextjs-webpack',
      store: 'pack', // Use pack format for better compression
      version: '1.0.0',
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      buildDependencies: {
        config: [__filename],
      },
      managedPaths: isServer ? ['node_modules'] : [],
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
    minimumCacheTTL: 31536000, // 1 year
  },

  // Enable compression
  compress: true,
}

module.exports = nextConfig
