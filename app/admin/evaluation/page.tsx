import type { Metadata } from "next"
import { SiteEvaluationDashboard } from "@/components/admin/site-evaluation-dashboard"
import { QualityMetricsAnalyzer } from "@/components/admin/quality-metrics-analyzer"
import { PerformanceMonitor } from "@/components/admin/performance-monitor"
import { AutomatedHealthChecks } from "@/components/admin/automated-health-checks"
import { EvaluationReportsGenerator } from "@/components/admin/evaluation-reports-generator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Site Evaluation Dashboard",
  description: "Comprehensive site construction, SEO, and performance evaluation system",
  robots: {
    index: false,
    follow: false,
  },
}

export default function SiteEvaluationPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Site Evaluation Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive analysis of site construction, SEO performance, and quality metrics with continuous monitoring
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="health">Health Checks</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <SiteEvaluationDashboard />
          </TabsContent>

          <TabsContent value="quality">
            <QualityMetricsAnalyzer />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceMonitor />
          </TabsContent>

          <TabsContent value="health">
            <AutomatedHealthChecks />
          </TabsContent>

          <TabsContent value="reports">
            <EvaluationReportsGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
