'use client'

import Image from 'next/image'

interface EnvironmentsPageClientProps {
  collections: any[]
  images: any[]
}

export function EnvironmentsPageClient({ collections, images }: EnvironmentsPageClientProps) {
  return (
    <main className="w-full bg-black">
      <section id="nature" className="w-full h-96 border-b border-slate-700 flex items-center justify-center">
        <div className="text-center text-slate-200">
          <h2 className="text-4xl font-light mb-2">Nature</h2>
          <p className="text-sm text-slate-400">Immersive natural environments</p>
        </div>
      </section>
      
      <section id="culture" className="w-full h-96 border-b border-slate-700 flex items-center justify-center">
        <div className="text-center text-slate-200">
          <h2 className="text-4xl font-light mb-2">Culture</h2>
          <p className="text-sm text-slate-400">Heritage and cultural experiences</p>
        </div>
      </section>
      
      <section id="mythic" className="w-full h-96 border-b border-slate-700 flex items-center justify-center hidden">
        <div className="text-center text-slate-200">
          <h2 className="text-4xl font-light mb-2">Mythic</h2>
          <p className="text-sm text-slate-400">Legendary worlds and mythology</p>
        </div>
      </section>
      
      <section id="art" className="w-full h-96 border-b border-slate-700 flex items-center justify-center">
        <div className="text-center text-slate-200">
          <h2 className="text-4xl font-light mb-2">Art</h2>
          <p className="text-sm text-slate-400">Creative expression and installations</p>
        </div>
      </section>
    </main>
  )
}
