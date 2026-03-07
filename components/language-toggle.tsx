"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/contexts/language-context"
import { Globe } from "lucide-react"
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
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLanguageChange}
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
