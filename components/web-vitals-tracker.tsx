"use client"

import { useEffect } from "react"
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals"

export function WebVitalsTracker() {
  useEffect(() => {
    // Track Core Web Vitals
    getCLS((metric) => {
      trackPerformanceMetric("CLS", metric.value)
    })

    getFID((metric) => {
      trackPerformanceMetric("FID", metric.value)
    })

    getFCP((metric) => {
      trackPerformanceMetric("FCP", metric.value)
    })

    getLCP((metric) => {
      trackPerformanceMetric("LCP", metric.value)
    })

    getTTFB((metric) => {
      trackPerformanceMetric("TTFB", metric.value)
    })
  }, [])

  const trackPerformanceMetric = async (name: string, value: number) => {
    try {
      await fetch("/api/analytics/performance/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metric_name: name,
          metric_value: value,
          page: window.location.pathname,
          user_agent: navigator.userAgent,
          connection_type: (navigator as any).connection?.effectiveType || "unknown",
        }),
      })
    } catch (error) {
      console.error("Failed to track performance metric:", error)
    }
  }

  return null
}
