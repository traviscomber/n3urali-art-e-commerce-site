"use client"

import { useEffect } from "react"
import { onCLS, onFID, onFCP, onLCP, onTTFB } from "web-vitals"

export function WebVitalsTracker() {
  useEffect(() => {
    // Track Core Web Vitals
    onCLS((metric) => {
      trackPerformanceMetric("CLS", metric.value)
    })

    onFID((metric) => {
      trackPerformanceMetric("FID", metric.value)
    })

    onFCP((metric) => {
      trackPerformanceMetric("FCP", metric.value)
    })

    onLCP((metric) => {
      trackPerformanceMetric("LCP", metric.value)
    })

    onTTFB((metric) => {
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
