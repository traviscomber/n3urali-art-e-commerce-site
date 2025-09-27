"use client"

import * as React from "react"

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "dark",
  enableSystem = false,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState(defaultTheme)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") || defaultTheme
      setTheme(savedTheme)
      document.documentElement.setAttribute(attribute, savedTheme)
    }
  }, [attribute, defaultTheme])

  const value = React.useMemo(
    () => ({
      theme,
      setTheme: (newTheme: string) => {
        setTheme(newTheme)
        if (typeof window !== "undefined") {
          localStorage.setItem("theme", newTheme)
          document.documentElement.setAttribute(attribute, newTheme)
        }
      },
    }),
    [theme, attribute],
  )

  if (!mounted) {
    return <>{children}</>
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

const ThemeContext = React.createContext<
  | {
      theme: string
      setTheme: (theme: string) => void
    }
  | undefined
>(undefined)

export const useTheme = () => {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
