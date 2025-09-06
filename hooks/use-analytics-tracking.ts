"use client"

import { useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"

interface TrackingEvent {
  event: string
  properties?: Record<string, any>
  timestamp?: number
}

interface PageViewEvent {
  page: string
  title?: string
  referrer?: string
  userAgent?: string
  timestamp: number
}

interface UserInteractionEvent {
  action: string
  element?: string
  value?: string | number
  page: string
  timestamp: number
}

export function useAnalyticsTracking() {
  const pathname = usePathname()

  // Track page views
  useEffect(() => {
    trackPageView({
      page: pathname,
      title: document.title,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    })
  }, [pathname])

  const trackPageView = useCallback(async (data: PageViewEvent) => {
    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "page_view",
          data,
        }),
      })
    } catch (error) {
      console.error("Failed to track page view:", error)
    }
  }, [])

  const trackEvent = useCallback(
    async (event: TrackingEvent) => {
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "event",
            data: {
              ...event,
              page: pathname,
              timestamp: event.timestamp || Date.now(),
            },
          }),
        })
      } catch (error) {
        console.error("Failed to track event:", error)
      }
    },
    [pathname],
  )

  const trackUserInteraction = useCallback(
    (data: Omit<UserInteractionEvent, "page" | "timestamp">) => {
      trackEvent({
        event: "user_interaction",
        properties: {
          ...data,
          page: pathname,
          timestamp: Date.now(),
        },
      })
    },
    [trackEvent, pathname],
  )

  // Specific tracking functions
  const trackImageView = useCallback(
    (imageId: string, imageTitle: string) => {
      trackEvent({
        event: "image_view",
        properties: {
          imageId,
          imageTitle,
        },
      })
    },
    [trackEvent],
  )

  const trackImagePurchase = useCallback(
    (imageId: string, imageTitle: string, price: number) => {
      trackEvent({
        event: "image_purchase",
        properties: {
          imageId,
          imageTitle,
          price,
        },
      })
    },
    [trackEvent],
  )

  const trackSearch = useCallback(
    (query: string, resultsCount: number) => {
      trackEvent({
        event: "search",
        properties: {
          query,
          resultsCount,
        },
      })
    },
    [trackEvent],
  )

  const trackCartAction = useCallback(
    (action: "add" | "remove", imageId: string, imageTitle: string) => {
      trackEvent({
        event: "cart_action",
        properties: {
          action,
          imageId,
          imageTitle,
        },
      })
    },
    [trackEvent],
  )

  const trackDownload = useCallback(
    (imageId: string, imageTitle: string) => {
      trackEvent({
        event: "download",
        properties: {
          imageId,
          imageTitle,
        },
      })
    },
    [trackEvent],
  )

  return {
    trackPageView,
    trackEvent,
    trackUserInteraction,
    trackImageView,
    trackImagePurchase,
    trackSearch,
    trackCartAction,
    trackDownload,
  }
}
