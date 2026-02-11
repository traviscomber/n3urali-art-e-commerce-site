/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.backblazeb2.com',
        pathname: '/file/**',
      },
      {
        protocol: 'https',
        hostname: 'f005.backblazeb2.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/**',
      },
      {
        protocol: 'https',
        hostname: 'pamfhqilohsqbifujtjz.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Disable automatic metadata file detection to prevent manifest conflicts
    disableStaticImages: false,
    skipMiddlewareUrlNormalization: false,
  },
  compiler: {
    removeConsole: false,
  },
  reactStrictMode: false,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Use custom build output to prevent manifest conflicts
  outputFileTracingIncludes: {},
  // Prevent Next.js from auto-detecting and generating manifest routes
  webpack: (config, { isServer }) => {
    // Override module rules to prevent .webmanifest from being treated as a route
    config.module.rules = config.module.rules.map((rule) => {
      if (rule.test?.toString().includes('webmanifest')) {
        return {
          ...rule,
          type: 'asset/resource',
        }
      }
      return rule
    })
    
    return config
  },
}

export default nextConfig
