'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Video, Settings, ArrowRight } from 'lucide-react'

export default function SimpleAdminPage() {
  return (
    <div className="min-h-screen w-full bg-black py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-light text-white mb-2 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-400 font-light">
            Manage your immersive content and collections
          </p>
        </div>

        {/* Main Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Video Upload Card */}
          <Card className="bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-colors">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <Video className="h-6 w-6 text-cyan-400" />
                <CardTitle className="text-white">Upload Videos</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Upload hero videos and collection media to Vercel Blob
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-400">
                MP4, WebM formats. Videos will be linked to collections automatically.
              </p>
              <Button asChild className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                <Link href="/admin/videos" className="flex items-center justify-between">
                  Go to Video Upload
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Collections Settings Card */}
          <Card className="bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-colors">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <Settings className="h-6 w-6 text-purple-400" />
                <CardTitle className="text-white">Collections</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Manage featured collections and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-400">
                Configure which collections are featured on the homepage.
              </p>
              <Button asChild variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800/50">
                <Link href="/admin" className="flex items-center justify-between">
                  Go to Full Admin
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start Guide */}
        <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-800/30">
          <CardHeader>
            <CardTitle className="text-white">Quick Start: Upload Hero Video</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm text-gray-300">
              <li className="flex gap-3">
                <span className="text-cyan-400 font-semibold flex-shrink-0 w-6">1.</span>
                <span>Click "Go to Video Upload" above</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 font-semibold flex-shrink-0 w-6">2.</span>
                <span>Select your video file (MP4 or WebM format)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 font-semibold flex-shrink-0 w-6">3.</span>
                <span>Add a title and mark as featured collection</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 font-semibold flex-shrink-0 w-6">4.</span>
                <span>Click Upload - video will appear on homepage automatically</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
