"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useSearchParams } from "next/navigation"

type Language = "es" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isLoaded: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Dynamically load translations to avoid webpack serialization bloat
const loadTranslations = async (lang: Language): Promise<Record<string, string>> => {
  try {
    if (lang === "es") {
      const { translationsES } = await import("@/lib/translations/es")
      return translationsES
    } else {
      const { translationsEN } = await import("@/lib/translations/en")
      return translationsEN
    }
  } catch (error) {
    console.error(`Failed to load ${lang} translations:`, error)
    return {}
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [isLoaded, setIsLoaded] = useState(false)
  const [translationCache, setTranslationCache] = useState<Record<Language, Record<string, string>>>({
    es: {},
    en: {},
  })
  const searchParams = useSearchParams()

  useEffect(() => {
    const initializeLanguage = async () => {
      const langParam = searchParams?.get("lang") as Language | null
      let selectedLang: Language = "en"

      if (langParam && (langParam === "es" || langParam === "en")) {
        selectedLang = langParam
        localStorage.setItem("language", langParam)
      } else {
        const savedLang = localStorage.getItem("language") as Language | null
        if (savedLang && (savedLang === "es" || savedLang === "en")) {
          selectedLang = savedLang
        }
      }

      setLanguageState(selectedLang)

      // Load translations dynamically
      const translations = await loadTranslations(selectedLang)
      setTranslationCache((prev) => ({ ...prev, [selectedLang]: translations }))
      setIsLoaded(true)
    }

    initializeLanguage()
  }, [searchParams])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)

    // Load the other language translations on demand
    if (!translationCache[lang] || Object.keys(translationCache[lang]).length === 0) {
      loadTranslations(lang).then((translations) => {
        setTranslationCache((prev) => ({ ...prev, [lang]: translations }))
      })
    }
  }

  const t = (key: string): string => {
    const validLanguage = language === "es" || language === "en" ? language : "en"
    const translations = translationCache[validLanguage]
    return translations?.[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoaded }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
