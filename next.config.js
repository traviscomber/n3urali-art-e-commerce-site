/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Optimize webpack cache for large string serialization
    if (config.cache && typeof config.cache === 'object') {
      config.cache = {
        ...config.cache,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        buildDependencies: {
          config: [__filename],
        },
      }
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
