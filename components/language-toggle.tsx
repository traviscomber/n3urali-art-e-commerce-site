"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/contexts/language-context"

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === "es" ? "en" : "es")}
      className="relative hover:bg-card/50 transition-all duration-300 group"
      title={language === "es" ? "Switch to English" : "Cambiar a Español"}
    >
      {language === "es" ? (
        <div className="flex items-center gap-2">
          <span className="text-2xl">🇨🇱</span>
          <span className="text-xs font-medium hidden sm:inline">ES</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-2xl">🇬🇧</span>
          <span className="text-xs font-medium hidden sm:inline">EN</span>
        </div>
      )}
    </Button>
  )
}
