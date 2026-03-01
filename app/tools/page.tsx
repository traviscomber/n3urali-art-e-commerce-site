'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Image,
  Layers,
  Zap,
  Settings,
  BarChart3,
  FileUp,
  Grid3x3,
  Palette,
  Maximize2,
} from 'lucide-react'

interface Tool {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  status: 'available' | 'coming-soon' | 'beta'
  features: string[]
  route?: string
}

export default function ToolsPage() {
  const router = useRouter()

  const tools: Tool[] = [
    {
      id: 'image-organizer',
      name: 'Image Organizer',
      description: 'Organize and manage your 360° image collection with advanced tagging and categorization',
      icon: <Grid3x3 className="h-8 w-8" />,
      status: 'coming-soon',
      features: ['Batch tagging', 'Category management', 'Collection creation', 'Advanced search'],
      route: '/tools/image-organizer',
    },
    {
      id: 'batch-uploader',
      name: 'Batch Uploader',
      description: 'Upload multiple images at once with metadata management and progress tracking',
      icon: <FileUp className="h-8 w-8" />,
      status: 'coming-soon',
      features: ['Multi-file upload', 'Metadata templates', 'Progress tracking', 'Error recovery'],
      route: '/tools/batch-uploader',
    },
    {
      id: 'image-converter',
      name: 'Image Converter',
      description: 'Convert between equirectangular, fisheye, and other 360° formats',
      icon: <Layers className="h-8 w-8" />,
      status: 'coming-soon',
      features: ['Format conversion', 'Resolution scaling', 'Batch processing', 'Quality presets'],
    },
    {
      id: 'metadata-editor',
      name: 'Metadata Editor',
      description: 'Edit XMP metadata, keywords, and licensing information for your images',
      icon: <Settings className="h-8 w-8" />,
      status: 'coming-soon',
      features: ['XMP editing', 'Batch updates', 'Template application', 'Export profiles'],
    },
    {
      id: 'analytics-dashboard',
      name: 'Analytics Dashboard',
      description: 'Track image performance, views, downloads, and revenue metrics',
      icon: <BarChart3 className="h-8 w-8" />,
      status: 'coming-soon',
      features: ['Performance tracking', 'Revenue analytics', 'Usage reports', 'Export data'],
    },
    {
      id: 'image-preview',
      name: '360° Preview',
      description: 'Preview equirectangular and fisheye images in interactive 360° viewer',
      icon: <Maximize2 className="h-8 w-8" />,
      status: 'coming-soon',
      features: ['Interactive viewer', 'Zoom controls', 'Export snapshot', 'VR mode support'],
    },
    {
      id: 'color-grader',
      name: 'Color Grader',
      description: 'Adjust color correction, brightness, contrast, and saturation for your images',
      icon: <Palette className="h-8 w-8" />,
      status: 'coming-soon',
      features: ['Color adjustments', 'LUT application', 'Batch processing', 'Undo/redo'],
    },
    {
      id: 'quality-analyzer',
      name: 'Quality Analyzer',
      description: 'Analyze image quality, detect artifacts, and get optimization recommendations',
      icon: <Zap className="h-8 w-8" />,
      status: 'coming-soon',
      features: ['Artifact detection', 'Quality scoring', 'Optimization tips', 'Comparison mode'],
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800'
      case 'beta':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800'
      case 'coming-soon':
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/30 dark:text-slate-200 dark:border-slate-800'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available'
      case 'beta':
        return 'Beta'
      case 'coming-soon':
        return 'Coming Soon'
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-slate-900 shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="bg-white hover:bg-gray-100 text-slate-900 border-slate-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-white">Content Tools</h1>
              <p className="text-xl text-slate-300 font-medium">Image management & optimization suite</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white border-2 border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Image className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Tools</p>
                  <p className="text-3xl font-bold text-slate-900">{tools.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-2 border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Zap className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Available Now</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {tools.filter((t) => t.status === 'available').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-2 border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Layers className="h-6 w-6 text-orange-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Coming Soon</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {tools.filter((t) => t.status === 'coming-soon').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <Card
              key={tool.id}
              className="overflow-hidden bg-white border-2 border-slate-200 shadow-md hover:shadow-lg transition-shadow"
            >
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 border-b border-orange-700 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/20 rounded-lg text-white">{tool.icon}</div>
                    <div>
                      <CardTitle className="text-xl text-white">{tool.name}</CardTitle>
                      <CardDescription className="text-orange-100 mt-1">{tool.description}</CardDescription>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(tool.status)} flex-shrink-0 whitespace-nowrap`}>
                    {getStatusLabel(tool.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Key Features</h4>
                  <ul className="space-y-2">
                    {tool.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                        <div className="w-1.5 h-1.5 bg-orange-600 rounded-full flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                {tool.status === 'available' && tool.route ? (
                  <Button
                    onClick={() => router.push(tool.route)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                  >
                    Open Tool
                  </Button>
                ) : (
                  <Button
                    disabled
                    className="w-full bg-slate-300 text-slate-600 cursor-not-allowed font-semibold"
                  >
                    {tool.status === 'coming-soon' ? 'Coming Soon' : 'Not Available'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="mt-8 border-2 border-orange-300 bg-orange-50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-600 rounded-lg">
                <Image className="h-6 w-6 text-white flex-shrink-0" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-orange-900 mb-2">Content Management Suite</h3>
                <p className="text-orange-900 font-medium leading-relaxed mb-3">
                  Our comprehensive tools suite is designed to streamline your 360° image management workflow. From
                  batch uploading to quality analysis, these tools help you manage, optimize, and distribute your
                  content efficiently.
                </p>
                <p className="text-sm text-orange-800 font-medium">
                  New tools are being added regularly. Check back soon for updates!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
