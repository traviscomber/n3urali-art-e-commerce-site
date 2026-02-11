"use client"

import { useLanguage } from "@/lib/contexts/language-context"

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} N3uralia360. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
