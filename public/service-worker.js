/**
 * Service Worker for intelligent caching of images and videos
 * Implements cache-first strategy for assets with network fallback
 */

const CACHE_VERSION = 'n3uralia-v1'
const CACHES_TO_KEEP = ['n3uralia-v1']

// Cache configuration
const CACHE_CONFIG = {
  images: {
    name: `${CACHE_VERSION}-images`,
    maxSize: 500 * 1024 * 1024, // 500MB
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  videos: {
    name: `${CACHE_VERSION}-videos`,
    maxSize: 2 * 1024 * 1024 * 1024, // 2GB
    maxAge: 60 * 24 * 60 * 60 * 1000, // 60 days
  },
  api: {
    name: `${CACHE_VERSION}-api`,
    maxSize: 50 * 1024 * 1024, // 50MB
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}

// Install event - clear old caches
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[Service Worker] Installing...')
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map((name) => {
          if (!CACHES_TO_KEEP.includes(name)) {
            console.log(`[Service Worker] Deleting old cache: ${name}`)
            return caches.delete(name)
          }
        }),
      )
      await self.skipWaiting()
    })(),
  )
})

// Activate event - clean up
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[Service Worker] Activating...')
  event.waitUntil(self.clients.claim())
})

// Fetch event - cache strategy
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip chrome extensions and other non-http(s) protocols
  if (!url.protocol.startsWith('http')) {
    return
  }

  // Route requests to appropriate cache strategy
  if (isImageRequest(url)) {
    event.respondWith(imageStrategy(request))
  } else if (isVideoRequest(url)) {
    event.respondWith(videoStrategy(request))
  } else if (isApiRequest(url)) {
    event.respondWith(apiStrategy(request))
  }
})

/**
 * Cache-first strategy for images
 * Check cache first, fall back to network
 */
async function imageStrategy(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_CONFIG.images.name)
  const cached = await cache.match(request)

  if (cached) {
    console.log(`[Service Worker] Cache hit: ${request.url}`)
    return cached
  }

  try {
    const response = await fetch(request)
    if (response.ok) {
      const clone = response.clone()
      cache.put(request, clone)
      console.log(`[Service Worker] Cached image: ${request.url}`)
    }
    return response
  } catch (error) {
    console.error(`[Service Worker] Fetch failed: ${request.url}`, error)
    // Return offline placeholder
    return new Response(
      JSON.stringify({ error: 'Offline - image not available' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    )
  }
}

/**
 * Network-first strategy for videos
 * Try network first, fall back to cache
 */
async function videoStrategy(request: Request): Promise<Response> {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_CONFIG.videos.name)
      const clone = response.clone()
      cache.put(request, clone)
      console.log(`[Service Worker] Cached video: ${request.url}`)
    }
    return response
  } catch (error) {
    console.error(`[Service Worker] Video fetch failed: ${request.url}`, error)
    const cache = await caches.open(CACHE_CONFIG.videos.name)
    const cached = await cache.match(request)
    if (cached) {
      console.log(`[Service Worker] Using cached video: ${request.url}`)
      return cached
    }
    return new Response(
      JSON.stringify({ error: 'Video not available' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    )
  }
}

/**
 * Stale-while-revalidate strategy for API calls
 * Return cache immediately, update in background
 */
async function apiStrategy(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_CONFIG.api.name)
  const cached = await cache.match(request)

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const clone = response.clone()
      cache.put(request, clone)
    }
    return response
  })

  return cached || fetchPromise
}

// Helper functions
function isImageRequest(url: URL): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif']
  const path = url.pathname.toLowerCase()
  return (
    imageExtensions.some((ext) => path.endsWith(ext)) ||
    url.pathname.includes('/api/image-optimize') ||
    url.pathname.includes('/api/image-proxy')
  )
}

function isVideoRequest(url: URL): boolean {
  const videoExtensions = ['.mp4', '.webm', '.m3u8', '.ts']
  const path = url.pathname.toLowerCase()
  return (
    videoExtensions.some((ext) => path.endsWith(ext)) ||
    url.pathname.includes('/api/video') ||
    url.pathname.includes('/hls/')
  )
}

function isApiRequest(url: URL): boolean {
  return url.pathname.includes('/api/')
}
