"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  Search,
  Globe,
  Shield,
  Zap,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  ImageIcon,
  Code,
  Smartphone,
} from "lucide-react"

interface EvaluationMetrics {
  seo: {
    score: number
    issues: string[]
    recommendations: string[]
  }
  performance: {
    score: number
    metrics: {
      fcp: number
      lcp: number
      cls: number
      fid: number
    }
  }
  accessibility: {
    score: number
    issues: string[]
  }
  security: {
    score: number
    checks: string[]
  }
  quality: {
    score: number
    metrics: {
      codeQuality: number
      imageOptimization: number
      contentQuality: number
    }
  }
}

export function SiteEvaluationDashboard() {
  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    // Simulate loading and evaluation
    const timer = setTimeout(() => {
      setMetrics({
        seo: {
          score: 92,
          issues: ["Some images missing alt text", "Meta descriptions could be more descriptive on product pages"],
          recommendations: [
            "Add structured data for products",
            "Implement breadcrumb navigation",
            "Optimize internal linking structure",
          ],
        },
        performance: {
          score: 88,
          metrics: {
            fcp: 1.2,
            lcp: 2.1,
            cls: 0.05,
            fid: 8,
          },
        },
        accessibility: {
          score: 95,
          issues: ["Some buttons need better focus indicators", "Color contrast could be improved in dark mode"],
        },
        security: {
          score: 98,
          checks: [
            "HTTPS enabled",
            "Security headers configured",
            "Content Security Policy active",
            "No mixed content detected",
          ],
        },
        quality: {
          score: 94,
          metrics: {
            codeQuality: 96,
            imageOptimization: 89,
            contentQuality: 97,
          },
        },
      })
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const runEvaluation = () => {
    setLoading(true)
    setLastUpdated(new Date())
    // Simulate re-evaluation
    setTimeout(() => {
      setLoading(false)
    }, 3000)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Running comprehensive site evaluation...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Analyzing SEO, performance, accessibility, security, and quality metrics
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!metrics) return null

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 70) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "bg-green-500/10 text-green-500 border-green-500/20"
    if (score >= 70) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    return "bg-red-500/10 text-red-500 border-red-500/20"
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          Last updated: {lastUpdated.toLocaleString()}
        </div>
        <Button onClick={runEvaluation} disabled={loading}>
          <Activity className="w-4 h-4 mr-2" />
          Run New Evaluation
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Search className="w-4 h-4" />
              SEO Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(metrics.seo.score)}`}>{metrics.seo.score}%</div>
            <Progress value={metrics.seo.score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(metrics.performance.score)}`}>
              {metrics.performance.score}%
            </div>
            <Progress value={metrics.performance.score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(metrics.accessibility.score)}`}>
              {metrics.accessibility.score}%
            </div>
            <Progress value={metrics.accessibility.score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(metrics.security.score)}`}>
              {metrics.security.score}%
            </div>
            <Progress value={metrics.security.score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(metrics.quality.score)}`}>{metrics.quality.score}%</div>
            <Progress value={metrics.quality.score} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="seo" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="seo">SEO Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="seo" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  SEO Issues
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {metrics.seo.issues.map((issue, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm">{issue}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {metrics.seo.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>SEO Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Meta titles optimized</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Meta descriptions present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Canonical URLs set</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Sitemap.xml present</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Robots.txt configured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Open Graph tags</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Schema markup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">Image alt texts (partial)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">First Contentful Paint (FCP)</span>
                    <Badge className={getScoreBadge(metrics.performance.metrics.fcp < 1.8 ? 95 : 70)}>
                      {metrics.performance.metrics.fcp}s
                    </Badge>
                  </div>
                  <Progress value={metrics.performance.metrics.fcp < 1.8 ? 95 : 70} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Largest Contentful Paint (LCP)</span>
                    <Badge className={getScoreBadge(metrics.performance.metrics.lcp < 2.5 ? 90 : 60)}>
                      {metrics.performance.metrics.lcp}s
                    </Badge>
                  </div>
                  <Progress value={metrics.performance.metrics.lcp < 2.5 ? 90 : 60} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cumulative Layout Shift (CLS)</span>
                    <Badge className={getScoreBadge(metrics.performance.metrics.cls < 0.1 ? 95 : 70)}>
                      {metrics.performance.metrics.cls}
                    </Badge>
                  </div>
                  <Progress value={metrics.performance.metrics.cls < 0.1 ? 95 : 70} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">First Input Delay (FID)</span>
                    <Badge className={getScoreBadge(metrics.performance.metrics.fid < 100 ? 95 : 70)}>
                      {metrics.performance.metrics.fid}ms
                    </Badge>
                  </div>
                  <Progress value={metrics.performance.metrics.fid < 100 ? 95 : 70} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Optimizations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Image optimization enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Code splitting implemented</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Lazy loading active</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">CDN configured</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Compression enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">Some large images could be optimized</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-green-500">Passed Checks</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Semantic HTML structure</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Keyboard navigation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">ARIA labels present</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Screen reader compatibility</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-yellow-500">Issues Found</h4>
                  <div className="space-y-2">
                    {metrics.accessibility.issues.map((issue, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.security.checks.map((check, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{check}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Code Quality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(metrics.quality.metrics.codeQuality)}`}>
                  {metrics.quality.metrics.codeQuality}%
                </div>
                <Progress value={metrics.quality.metrics.codeQuality} className="mt-2" />
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">TypeScript implementation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Component architecture</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Error handling</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Image Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(metrics.quality.metrics.imageOptimization)}`}>
                  {metrics.quality.metrics.imageOptimization}%
                </div>
                <Progress value={metrics.quality.metrics.imageOptimization} className="mt-2" />
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Next.js Image component</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">WebP format support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">Some large images</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Content Quality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(metrics.quality.metrics.contentQuality)}`}>
                  {metrics.quality.metrics.contentQuality}%
                </div>
                <Progress value={metrics.quality.metrics.contentQuality} className="mt-2" />
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Ultra high-quality platform content</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Professional descriptions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Consistent branding</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Mobile Responsiveness Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Mobile Responsiveness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500 mb-2">✓</div>
              <p className="text-sm font-medium">Mobile Friendly</p>
              <p className="text-xs text-muted-foreground">Responsive design implemented</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500 mb-2">✓</div>
              <p className="text-sm font-medium">Touch Optimized</p>
              <p className="text-xs text-muted-foreground">Touch targets properly sized</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500 mb-2">✓</div>
              <p className="text-sm font-medium">Fast Loading</p>
              <p className="text-xs text-muted-foreground">Optimized for mobile networks</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
