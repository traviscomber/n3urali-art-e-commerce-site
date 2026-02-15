'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Video, Image, Settings } from 'lucide-react'

export default function SimpleAdminPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your content and configurations</p>
        </div>

        {/* Admin Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Video Upload Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Video className="h-6 w-6 text-blue-500" />
                <CardTitle>Upload Videos</CardTitle>
              </div>
              <CardDescription>
                Upload videos to Supabase Storage and link them to collections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Support for MP4, WebM, and other video formats. Max 500MB per file.
              </p>
              <Button asChild className="w-full">
                <Link href="/admin/videos">Go to Video Upload</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Featured Images Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Image className="h-6 w-6 text-purple-500" />
                <CardTitle>Featured Images</CardTitle>
              </div>
              <CardDescription>
                Manage and upload featured images for collections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Upload high-quality images for your featured content.
              </p>
              <Button asChild className="w-full">
                <Link href="/admin/featured-images">Go to Featured Images</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card className="hover:shadow-lg transition-shadow md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Settings className="h-6 w-6 text-gray-500" />
                <CardTitle>Collections</CardTitle>
              </div>
              <CardDescription>
                View and manage your collections, videos, and configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Access detailed analytics and manage all your collections from here.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin">Go to Full Admin Panel</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start Section */}
        <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold mb-3">Quick Start: Upload a Video</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Click "Go to Video Upload" above</li>
            <li>Select your video file (MP4 or WebM)</li>
            <li>Add optional title, description, and collection code (e.g., "studio")</li>
            <li>Click "Upload Video"</li>
            <li>Copy the public URL from the success message</li>
            <li>The video will be linked to your collection automatically</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
