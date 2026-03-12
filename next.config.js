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
  webpack: (config, { isServer }) => {
    // Disable webpack cache to avoid stale cache issues from project directory changes
    config.cache = false
    return config
  },
}

module.exports = nextConfig
