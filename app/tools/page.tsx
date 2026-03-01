'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Sparkles,
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
      id: 'clar1ty',
      name: 'Clar1ty',
      description: 'TBD',
      icon: <Sparkles className="h-8 w-8" />,
      status: 'coming-soon',
      features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
      route: '/tools/clar1ty',
    },
    {
      id: 'visioncraft',
      name: 'VisionCraft',
      description: 'TBD',
      icon: <Palette className="h-8 w-8" />,
      status: 'coming-soon',
      features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
      route: '/tools/visioncraft',
    },
    {
      id: 'tool-3',
      name: 'Tool 3',
      description: 'TBD',
      icon: <Layers className="h-8 w-8" />,
      status: 'coming-soon',
      features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
    },
    {
      id: 'tool-4',
      name: 'Tool 4',
      description: 'TBD',
      icon: <Settings className="h-8 w-8" />,
      status: 'coming-soon',
      features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
    },
    {
      id: 'tool-5',
      name: 'Tool 5',
      description: 'TBD',
      icon: <BarChart3 className="h-8 w-8" />,
      status: 'coming-soon',
      features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
    },
    {
      id: 'tool-6',
      name: 'Tool 6',
      description: 'TBD',
      icon: <Maximize2 className="h-8 w-8" />,
      status: 'coming-soon',
      features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
    },
    {
      id: 'tool-7',
      name: 'Tool 7',
      description: 'TBD',
      icon: <FileUp className="h-8 w-8" />,
      status: 'coming-soon',
      features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
    },
    {
      id: 'tool-8',
      name: 'Tool 8',
      description: 'TBD',
      icon: <Grid3x3 className="h-8 w-8" />,
      status: 'coming-soon',
      features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
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
              <h1 className="text-4xl font-bold text-white">Production Tools</h1>
              <p className="text-xl text-slate-300 font-medium">Create and generate final products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-2 border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Sparkles className="h-6 w-6 text-blue-700" />
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
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Layers className="h-6 w-6 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">In Beta</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {tools.filter((t) => t.status === 'beta').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-2 border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-orange-700" />
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
              className="overflow-hidden bg-white border-2 border-slate-200 shadow-lg"
            >
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 border-b border-orange-700">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-white flex items-center gap-3">
                      {tool.name}
                      <Badge className={getStatusColor(tool.status)}>{getStatusLabel(tool.status)}</Badge>
                    </CardTitle>
                    <CardDescription className="text-base mt-1 text-orange-100">
                      {tool.description || 'Coming soon'}
                    </CardDescription>
                  </div>
                  <div className="p-3 bg-white/20 rounded-lg text-white flex-shrink-0">
                    {tool.icon}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                      <Sparkles className="h-5 w-5 text-orange-600" />
                      Features
                    </h3>
                    <div className="space-y-2">
                      {tool.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200"
                        >
                          <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="text-slate-900 flex-1 font-medium">{feature}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    disabled={tool.status === 'coming-soon' || !tool.route}
                    onClick={() => tool.route && router.push(tool.route)}
                    className={`w-full py-3 rounded font-semibold transition-colors mt-4 ${
                      tool.status === 'available' && tool.route
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-slate-300 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {tool.status === 'coming-soon' ? 'Coming Soon' : 'Open Tool'}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="mt-8 border-2 border-orange-300 bg-orange-50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-600 rounded-lg">
                <Sparkles className="h-6 w-6 text-white flex-shrink-0" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-orange-900 mb-2">Production Tools Suite</h3>
                <p className="text-orange-900 font-medium leading-relaxed">
                  A comprehensive suite of tools designed to help you create and generate final products. Each tool is crafted to streamline your workflow and maximize productivity.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
