"use client"

import { useLanguage } from "@/lib/contexts/language-context"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const handleLanguageChange = () => {
    const newLang = language === "es" ? "en" : "es"
    setLanguage(newLang)
    
    // Update URL with language parameter for persistence
    const params = new URLSearchParams(searchParams || "")
    params.set("lang", newLang)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <button
      onClick={handleLanguageChange}
      className="relative inline-flex items-center justify-between w-16 h-8 px-1 bg-slate-800 border border-slate-700 rounded-full transition-colors duration-300 hover:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
      title={language === "es" ? "Switch to English" : "Cambiar a Español"}
      aria-label={`Language toggle: ${language === "es" ? "Switch to English" : "Switch to Spanish"}`}
    >
      {/* Sliding background indicator */}
      <div
        className={`absolute w-7 h-6 bg-cyan-500/20 rounded-full transition-transform duration-300 ${
          language === "es" ? "translate-x-0" : "translate-x-8"
        }`}
      />
      
      {/* EN label */}
      <span
        className={`relative z-10 w-7 text-center text-xs font-medium transition-colors duration-300 ${
          language === "en"
            ? "text-cyan-400"
            : "text-slate-500"
        }`}
      >
        EN
      </span>
      
      {/* ES label */}
      <span
        className={`relative z-10 w-7 text-center text-xs font-medium transition-colors duration-300 ${
          language === "es"
            ? "text-cyan-400"
            : "text-slate-500"
        }`}
      >
        ES
      </span>
    </button>
  )
}
