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
    // Completely disable webpack caching to prevent corruption from old project paths
    config.cache = false
    config.infrastructureLogging = { level: 'error' }
    return config
  },
}

module.exports = nextConfig
