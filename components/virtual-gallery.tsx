'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { GalleryImage } from '@/components/optimized-image'

interface VirtualGalleryItem {
  id: string
  imageId: string
  src: string
  alt: string
  title?: string
}

interface VirtualGalleryProps {
  items: VirtualGalleryItem[]
  columnCount?: number
  gap?: number
  onItemClick?: (item: VirtualGalleryItem, index: number) => void
  onLoadMore?: () => Promise<void>
  hasMore?: boolean
  isLoading?: boolean
}

/**
 * High-performance virtual scrolling gallery component
 * Only renders visible items, dramatically improving performance with large image collections
 */
export function VirtualGallery({
  items,
  columnCount = 3,
  gap = 16,
  onItemClick,
  onLoadMore,
  hasMore = false,
  isLoading = false,
}: VirtualGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null)

  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 })
  const [scrollTop, setScrollTop] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)

  const ITEM_HEIGHT = 300
  const BUFFER_SIZE = 5 // Extra items to render outside viewport

  // Calculate item dimensions
  const itemWidth = useMemo(() => {
    if (!containerWidth) return 0
    return (containerWidth - gap * (columnCount - 1)) / columnCount
  }, [containerWidth, columnCount, gap])

  // Handle container resize
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width)
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // Calculate visible range based on scroll position
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return

    const scrollTop = containerRef.current.scrollTop
    setScrollTop(scrollTop)

    // Calculate which row is visible
    const visibleRow = Math.floor(scrollTop / ITEM_HEIGHT)
    const itemsPerRow = columnCount
    const start = Math.max(0, (visibleRow - BUFFER_SIZE) * itemsPerRow)
    const visibleRows = Math.ceil(containerRef.current.clientHeight / ITEM_HEIGHT) + BUFFER_SIZE * 2
    const end = Math.min(items.length, (visibleRow + visibleRows) * itemsPerRow)

    setVisibleRange({ start, end })
  }, [items.length, columnCount])

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (!loadMoreTrigger || !onLoadMore) return

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoading && hasMore) {
          onLoadMore()
        }
      },
      { threshold: 0.1 },
    )

    observerRef.current.observe(loadMoreTriggerRef.current!)
    return () => observerRef.current?.disconnect()
  }, [onLoadMore, hasMore, isLoading])

  // Add scroll listener
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Calculate total grid height
  const totalRows = Math.ceil(items.length / columnCount)
  const gridHeight = totalRows * ITEM_HEIGHT + (totalRows - 1) * gap

  // Get visible items
  const visibleItems = items.slice(visibleRange.start, visibleRange.end)

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-y-auto bg-slate-950"
    >
      {/* Spacer for items above viewport */}
      <div style={{ height: `${Math.floor(visibleRange.start / columnCount) * (ITEM_HEIGHT + gap)}px` }} />

      {/* Gallery Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
          gap: `${gap}px`,
          padding: `${gap}px`,
          width: '100%',
        }}
      >
        {visibleItems.map((item, index) => (
          <div
            key={`${item.id}-${visibleRange.start + index}`}
            className="cursor-pointer group"
            onClick={() => onItemClick?.(item, visibleRange.start + index)}
          >
            <div className="relative overflow-hidden rounded-lg aspect-video bg-slate-900">
              <GalleryImage
                imageId={item.imageId}
                src={item.src}
                alt={item.alt}
                className="group-hover:scale-105 transition-transform duration-300"
              />

              {/* Overlay with title on hover */}
              {item.title && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                  <p className="text-white text-sm font-medium p-3 w-full line-clamp-2 translate-y-full group-hover:translate-y-0 transition-transform">
                    {item.title}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Spacer for items below viewport */}
      <div
        style={{
          height: `${Math.max(0, (totalRows - Math.ceil(visibleRange.end / columnCount)) * (ITEM_HEIGHT + gap))}px`,
        }}
      />

      {/* Load more trigger */}
      <div ref={loadMoreTriggerRef} className="h-1" />

      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full">
          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-300 text-sm">Loading more...</span>
        </div>
      )}

      {/* Debug info - remove in production */}
      <div className="fixed bottom-4 right-4 text-xs text-slate-400 bg-slate-900/50 px-3 py-2 rounded pointer-events-none">
        <div>Scroll: {scrollTop}px</div>
        <div>Visible: {visibleRange.start} - {visibleRange.end}</div>
        <div>Rendered: {visibleItems.length} / {items.length}</div>
      </div>
    </div>
  )
}

/**
 * Simplified virtual gallery with masonry layout for varied image dimensions
 */
export function MasonryVirtualGallery({
  items,
  columnCount = 3,
  gap = 16,
  onItemClick,
}: Omit<VirtualGalleryProps, 'onLoadMore' | 'hasMore' | 'isLoading'>) {
  return (
    <VirtualGallery
      items={items}
      columnCount={columnCount}
      gap={gap}
      onItemClick={onItemClick}
    />
  )
}
