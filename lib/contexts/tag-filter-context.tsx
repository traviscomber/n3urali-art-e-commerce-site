"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface TagFilterContextType {
  selectedTags: string[]
  toggleTag: (tag: string) => void
  clearTags: () => void
  hasActiveTags: boolean
}

const TagFilterContext = createContext<TagFilterContextType | undefined>(undefined)

interface TagFilterProviderProps {
  children: ReactNode
}

export function TagFilterProvider({ children }: TagFilterProviderProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        // Remove tag if already selected
        return prev.filter((t) => t !== tag)
      } else {
        // Add tag if not selected
        return [...prev, tag]
      }
    })
  }

  const clearTags = () => {
    setSelectedTags([])
  }

  const hasActiveTags = selectedTags.length > 0

  return (
    <TagFilterContext.Provider
      value={{
        selectedTags,
        toggleTag,
        clearTags,
        hasActiveTags,
      }}
    >
      {children}
    </TagFilterContext.Provider>
  )
}

export function useTagFilter() {
  const context = useContext(TagFilterContext)
  if (context === undefined) {
    throw new Error("useTagFilter must be used within a TagFilterProvider")
  }
  return context
}
