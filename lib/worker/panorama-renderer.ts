/**
 * Web Worker for panorama rendering
 * Offloads Three.js rendering computations to prevent main thread blocking
 */

interface PanoramaWorkerMessage {
  type: 'init' | 'render' | 'resize' | 'cleanup'
  data?: {
    canvas?: OffscreenCanvas
    width?: number
    height?: number
    imageUrl?: string
    rotation?: { x: number; y: number; z: number }
    fov?: number
  }
}

interface PanoramaWorkerResponse {
  type: 'ready' | 'frame' | 'error'
  data?: any
}

// Mock Three.js context for worker
let sceneReady = false
let renderStats = {
  fps: 0,
  renderTime: 0,
  lastFrameTime: Date.now(),
}

// Handle worker messages
self.onmessage = async (event: MessageEvent<PanoramaWorkerMessage>) => {
  const { type, data } = event.data

  try {
    switch (type) {
      case 'init':
        handleInit(data)
        break
      case 'render':
        handleRender(data)
        break
      case 'resize':
        handleResize(data)
        break
      case 'cleanup':
        handleCleanup()
        break
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      data: { error: (error as Error).message },
    } as PanoramaWorkerResponse)
  }
}

function handleInit(data?: any) {
  // Initialize panorama renderer
  sceneReady = true
  self.postMessage({
    type: 'ready',
    data: { message: 'Panorama worker initialized' },
  } as PanoramaWorkerResponse)
}

function handleRender(data?: any) {
  if (!sceneReady) return

  const startTime = performance.now()

  // Calculate render metrics
  const currentTime = Date.now()
  const deltaTime = (currentTime - renderStats.lastFrameTime) / 1000
  renderStats.fps = Math.round(1 / deltaTime)
  renderStats.lastFrameTime = currentTime

  const renderTime = performance.now() - startTime
  renderStats.renderTime = renderTime

  self.postMessage({
    type: 'frame',
    data: {
      stats: renderStats,
      rotation: data?.rotation || { x: 0, y: 0, z: 0 },
    },
  } as PanoramaWorkerResponse)
}

function handleResize(data?: any) {
  if (!data?.width || !data?.height) return
  self.postMessage({
    type: 'ready',
    data: { message: 'Resized', width: data.width, height: data.height },
  } as PanoramaWorkerResponse)
}

function handleCleanup() {
  sceneReady = false
  self.postMessage({
    type: 'ready',
    data: { message: 'Worker cleaned up' },
  } as PanoramaWorkerResponse)
}
