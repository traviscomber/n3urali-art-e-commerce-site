'use client'

interface TheatreCategory {
  id: string
  title: string
  description: string
  videoUrl: string
}

const FEATURED_VIDEO = {
  title: 'Immersive Worlds',
  description: 'Explore boundless digital realms',
  videoUrl: 'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/WebBackdrop360-4.mov',
}

export default function TheatrePage() {
  return (
    <main className="min-h-screen w-full bg-black">
      {/* Header Section */}
      <div className="pt-20 pb-12 text-center border-b border-gray-800">
        <h1 className="text-5xl md:text-6xl font-light text-gray-400 mb-6 tracking-wide">
          Theatre
        </h1>
        <div className="space-y-2 text-gray-500 text-sm md:text-base">
          <p>Immerse yourself. No special requirements</p>
          <p>Bigger screen brings better experience</p>
          <p className="mt-4">A Living Immersive Catalog</p>
          <p>New worlds are released regularly</p>
        </div>
      </div>

      {/* Featured Video Section - Main Content */}
      <div className="w-full px-6 py-16 max-w-7xl mx-auto">
        <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden mb-12 group">
          <video
            src={FEATURED_VIDEO.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
          />

          {/* GO Button */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-24 h-24 rounded-full border-2 border-gray-600 group-hover:border-cyan-500 transition-colors duration-300 flex items-center justify-center">
              <span className="text-cyan-400 text-lg font-light tracking-wider">GO</span>
            </div>
          </div>
        </div>

        {/* Featured Category Title and Description */}
        <div className="text-center">
          <h2 className="text-3xl font-light text-gray-300 mb-2">
            {FEATURED_VIDEO.title}
          </h2>
          <p className="text-gray-500">
            {FEATURED_VIDEO.description}
          </p>
        </div>
      </div>
    </main>
  )
}
