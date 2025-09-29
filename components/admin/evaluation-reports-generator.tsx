"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  Zap,
  Globe,
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
} from "lucide-react"

interface ReportTemplate {
  id: string
  name: string
  description: string
  sections: string[]
  format: "pdf" | "html" | "json"
  frequency?: "daily" | "weekly" | "monthly"
}

interface ReportMetrics {
  seoScore: number
  performanceScore: number
  qualityScore: number
  securityScore: number
  accessibilityScore: number
  overallScore: number
  trendsData: {
    period: string
    seo: number[]
    performance: number[]
    quality: number[]
  }
}

export function EvaluationReportsGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [selectedSections, setSelectedSections] = useState<string[]>([])
  const [reportFormat, setReportFormat] = useState<string>("pdf")
  const [dateRange, setDateRange] = useState<string>("last-30-days")
  const [generating, setGenerating] = useState(false)
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null)

  const reportTemplates: ReportTemplate[] = [
    {
      id: "comprehensive",
      name: "Comprehensive Site Evaluation",
      description: "Complete analysis including SEO, performance, quality, security, and recommendations",
      sections: [
        "executive-summary",
        "seo-analysis",
        "performance-metrics",
        "quality-assessment",
        "security-review",
        "recommendations",
        "trends",
      ],
      format: "pdf",
    },
    {
      id: "performance-focused",
      name: "Performance Report",
      description: "Detailed performance analysis with Core Web Vitals and optimization recommendations",
      sections: ["executive-summary", "performance-metrics", "core-web-vitals", "optimization-opportunities", "trends"],
      format: "pdf",
    },
    {
      id: "seo-audit",
      name: "SEO Audit Report",
      description: "Complete SEO analysis with technical recommendations and content optimization",
      sections: [
        "executive-summary",
        "seo-analysis",
        "technical-seo",
        "content-analysis",
        "competitor-analysis",
        "recommendations",
      ],
      format: "pdf",
    },
    {
      id: "quality-assessment",
      name: "Quality Assessment Report",
      description: "Platform content quality analysis and code quality metrics",
      sections: [
        "executive-summary",
        "quality-assessment",
        "content-quality",
        "code-quality",
        "architecture-review",
        "recommendations",
      ],
      format: "pdf",
    },
    {
      id: "executive-summary",
      name: "Executive Summary",
      description: "High-level overview for stakeholders with key metrics and insights",
      sections: ["executive-summary", "key-metrics", "critical-issues", "recommendations"],
      format: "pdf",
    },
  ]

  const availableSections = [
    { id: "executive-summary", name: "Executive Summary", icon: <FileText className="w-4 h-4" /> },
    { id: "seo-analysis", name: "SEO Analysis", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "performance-metrics", name: "Performance Metrics", icon: <Zap className="w-4 h-4" /> },
    { id: "quality-assessment", name: "Quality Assessment", icon: <Shield className="w-4 h-4" /> },
    { id: "security-review", name: "Security Review", icon: <Shield className="w-4 h-4" /> },
    { id: "accessibility-audit", name: "Accessibility Audit", icon: <Eye className="w-4 h-4" /> },
    { id: "content-quality", name: "Content Quality", icon: <Globe className="w-4 h-4" /> },
    { id: "core-web-vitals", name: "Core Web Vitals", icon: <Activity className="w-4 h-4" /> },
    { id: "user-experience", name: "User Experience", icon: <Users className="w-4 h-4" /> },
    { id: "technical-seo", name: "Technical SEO", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "recommendations", name: "Recommendations", icon: <CheckCircle className="w-4 h-4" /> },
    { id: "trends", name: "Trends & Analytics", icon: <PieChart className="w-4 h-4" /> },
  ]

  const mockMetrics: ReportMetrics = {
    seoScore: 92,
    performanceScore: 88,
    qualityScore: 94,
    securityScore: 98,
    accessibilityScore: 95,
    overallScore: 93,
    trendsData: {
      period: "Last 30 Days",
      seo: [88, 89, 91, 92, 92],
      performance: [85, 86, 87, 88, 88],
      quality: [92, 93, 94, 94, 94],
    },
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = reportTemplates.find((t) => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      setSelectedSections(template.sections)
      setReportFormat(template.format)
    }
  }

  const toggleSection = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((s) => s !== sectionId) : [...prev, sectionId],
    )
  }

  const generateReport = async () => {
    setGenerating(true)

    // Simulate report generation
    setTimeout(() => {
      setGenerating(false)
      setLastGenerated(new Date())

      // In a real implementation, this would trigger the actual report generation
      console.log("Generating report with:", {
        template: selectedTemplate,
        sections: selectedSections,
        format: reportFormat,
        dateRange,
      })
    }, 3000)
  }

  const downloadSampleReport = () => {
    // In a real implementation, this would download the actual report
    const reportData = {
      title: "N3urali.art Site Evaluation Report",
      generatedAt: new Date().toISOString(),
      metrics: mockMetrics,
      sections: selectedSections,
      summary: "Ultra high-quality platform content with excellent performance metrics",
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `site-evaluation-report-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Evaluation Reports Generator</h2>
          <p className="text-muted-foreground">Generate comprehensive site evaluation reports and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          {lastGenerated && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Last generated: {lastGenerated.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Report Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {reportTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate === template.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {template.sections.length} sections
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {template.format.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      {selectedTemplate === template.id && <CheckCircle className="w-5 h-5 text-primary" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Report Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableSections.map((section) => (
                  <div key={section.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={section.id}
                      checked={selectedSections.includes(section.id)}
                      onCheckedChange={() => toggleSection(section.id)}
                    />
                    <label
                      htmlFor={section.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                    >
                      {section.icon}
                      {section.name}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                    <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                    <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                    <SelectItem value="last-year">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Export Format</label>
                <Select value={reportFormat} onValueChange={setReportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                    <SelectItem value="html">HTML Report</SelectItem>
                    <SelectItem value="json">JSON Data</SelectItem>
                    <SelectItem value="csv">CSV Export</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  onClick={generateReport}
                  disabled={generating || selectedSections.length === 0}
                  className="w-full"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>

                <Button variant="outline" onClick={downloadSampleReport} className="w-full bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Download Sample
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Metrics Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Current Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Overall Score</span>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                  {mockMetrics.overallScore}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">SEO Score</span>
                <span className="text-sm font-medium">{mockMetrics.seoScore}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Performance</span>
                <span className="text-sm font-medium">{mockMetrics.performanceScore}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Quality Score</span>
                <span className="text-sm font-medium">{mockMetrics.qualityScore}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Security</span>
                <span className="text-sm font-medium">{mockMetrics.securityScore}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Accessibility</span>
                <span className="text-sm font-medium">{mockMetrics.accessibilityScore}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Report Preview */}
      <Tabs defaultValue="preview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="preview">Report Preview</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedSections.length > 0 ? (
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h3 className="font-semibold">N3urali.art Site Evaluation Report</h3>
                    <p className="text-sm text-muted-foreground">
                      Generated on {new Date().toLocaleDateString()} • {selectedSections.length} sections •{" "}
                      {reportFormat.toUpperCase()} format
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-500">{mockMetrics.overallScore}%</div>
                      <p className="text-sm text-muted-foreground">Overall Score</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-500">{mockMetrics.seoScore}%</div>
                      <p className="text-sm text-muted-foreground">SEO Score</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-500">{mockMetrics.performanceScore}%</div>
                      <p className="text-sm text-muted-foreground">Performance</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-emerald-500">{mockMetrics.qualityScore}%</div>
                      <p className="text-sm text-muted-foreground">Quality</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Report Sections:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedSections.map((sectionId) => {
                        const section = availableSections.find((s) => s.id === sectionId)
                        return (
                          <div key={sectionId} className="flex items-center gap-2 text-sm">
                            {section?.icon}
                            <span>{section?.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Key Highlights:</h4>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Ultra high-quality platform content maintains excellent standards
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        All Core Web Vitals metrics within optimal ranges
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Security implementation exceeds industry standards
                      </li>
                      <li className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        Minor optimization opportunities identified
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select sections to preview your report</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Weekly Performance Report</h4>
                    <p className="text-sm text-muted-foreground">Every Monday at 9:00 AM</p>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Monthly Comprehensive Audit</h4>
                    <p className="text-sm text-muted-foreground">First day of each month</p>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule New Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Comprehensive Site Evaluation</h4>
                    <p className="text-sm text-muted-foreground">Generated 2 days ago</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Performance Report</h4>
                    <p className="text-sm text-muted-foreground">Generated 1 week ago</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">SEO Audit Report</h4>
                    <p className="text-sm text-muted-foreground">Generated 2 weeks ago</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
