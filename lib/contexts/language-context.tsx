"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useSearchParams } from "next/navigation"
import { translationsES } from "@/lib/translations/es"
import { translationsEN } from "@/lib/translations/en"

type Language = "es" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isLoaded: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  es: translationsES,
  en: translationsEN,
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [isLoaded, setIsLoaded] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const langParam = searchParams?.get("lang") as Language | null
    if (langParam && (langParam === "es" || langParam === "en")) {
      setLanguageState(langParam)
      localStorage.setItem("language", langParam)
    } else {
      const savedLang = localStorage.getItem("language") as Language | null
      if (savedLang && (savedLang === "es" || savedLang === "en")) {
        setLanguageState(savedLang)
      }
    }
    setIsLoaded(true)
  }, [searchParams])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string): string => {
    // Default to English if language is undefined or invalid
    const validLanguage = (language === "es" || language === "en") ? language : "en"
    const translationObj = translations[validLanguage as keyof typeof translations]
    if (!translationObj) {
      // Fallback to English if even that fails
      const enObj = translations.en
      return enObj?.[key as keyof typeof enObj] || key
    }
    return translationObj[key as keyof typeof translationObj] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t, isLoaded }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
