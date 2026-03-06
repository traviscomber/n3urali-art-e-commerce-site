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
      bodySizeLimit: '500mb',
    },
  },
  compiler: {
    removeConsole: false,
  },
  reactStrictMode: false,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  staticPageGenerationTimeout: 120,
  webpack: (config, { isServer }) => {
    config.cache = {
      type: 'filesystem',
      cacheDirectory: '.next/cache',
      buildDependencies: {
        config: [__filename],
      },
      version: 'v1',
      managedPaths: isServer ? ['node_modules'] : ['node_modules'],
      hashAlgorithm: 'md4',
      store: 'pack',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      profile: false,
      readonly: false,
      maxMemoryGenerations: 1,
    }
    return config
  },
}

export default nextConfig
