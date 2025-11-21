"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/contexts/language-context"
import { Globe } from "lucide-react"

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === "es" ? "en" : "es")}
      className="relative text-foreground hover:bg-accent hover:text-foreground transition-all duration-300 group"
      title={language === "es" ? "Switch to English" : "Cambiar a Español"}
    >
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{language === "es" ? "ES" : "EN"}</span>
      </div>
    </Button>
  )
}
