"use client"

import { useState, useContext } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mail, Copy, Check } from "lucide-react"
import { LanguageContext } from "@/lib/contexts/language-context"

interface EmailContactModalProps {
  isOpen: boolean
  onClose: () => void
}

export function EmailContactModal({ isOpen, onClose }: EmailContactModalProps) {
  const [copied, setCopied] = useState(false)
  const languageContext = useContext(LanguageContext)
  
  if (!languageContext) {
    throw new Error("EmailContactModal must be used within LanguageProvider")
  }

  const { t } = languageContext
  const email = "info@n3uralia360.art"

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            {t("contact.title")}
          </DialogTitle>
          <DialogDescription>
            {t("contact.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Email Display */}
          <div className="bg-background border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">{t("contact.emailLabel")}</p>
            <div className="flex items-center gap-2">
              <code className="text-lg font-mono font-semibold break-all flex-1">
                {email}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyEmail}
                className="flex-shrink-0 bg-transparent"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    {t("contact.copied")}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    {t("contact.copy")}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quotation Request Guide */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">{t("contact.quotationTitle")}</p>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {t("contact.quotationIntro")}
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-disc list-inside">
              <li>{t("contact.quotationItem1")}</li>
              <li>{t("contact.quotationItem2")}</li>
              <li>{t("contact.quotationItem3")}</li>
              <li>{t("contact.quotationItem4")}</li>
              <li>{t("contact.quotationItem5")}</li>
            </ul>
            <p className="text-xs text-blue-700 dark:text-blue-300 pt-2">
              {t("contact.quotationResponse")}
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold">{t("contact.instructionsTitle")}</p>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>{t("contact.instruction1")}</li>
              <li>{t("contact.instruction2")}</li>
              <li>{t("contact.instruction3")}</li>
              <li>{t("contact.instruction4")}</li>
            </ol>
            <p className="text-xs text-muted-foreground pt-2">
              {t("contact.responseTime")}
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">{t("contact.benefitsTitle")}</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>{t("contact.benefit1")}</li>
              <li>{t("contact.benefit2")}</li>
              <li>{t("contact.benefit3")}</li>
              <li>{t("contact.benefit4")}</li>
            </ul>
          </div>
        </div>

        {/* Close Button */}
        <Button onClick={onClose} className="w-full mt-4">
          {t("contact.closeButton")}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
