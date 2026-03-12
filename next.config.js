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
    // Force webpack to use memory-only cache with explicit error handler
    // This completely prevents attempts to read the corrupted old project path
    config.cache = {
      type: 'memory',
      cacheUnaffected: false,
    }
    config.output.hashFunction = 'xxhash64'
    config.infrastructureLogging = { 
      level: 'error',
      debug: []
    }
    return config
  },
}

module.exports = nextConfig
