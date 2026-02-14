"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mail, Copy, Check } from "lucide-react"
import { useLanguage } from "@/lib/contexts/language-context"

interface EmailContactModalProps {
  isOpen: boolean
  onClose: () => void
}

export function EmailContactModal({ isOpen, onClose }: EmailContactModalProps) {
  const [copied, setCopied] = useState(false)
  const { t } = useLanguage()
  const email = "info@n3uralia360.art"

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Contact Us
          </DialogTitle>
          <DialogDescription>
            Get in touch with our team at N3uralia360
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              Email Address
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white break-all">
              {email}
            </p>
          </div>

          <Button
            onClick={handleCopyEmail}
            className="w-full flex items-center justify-center gap-2"
            variant="default"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Email
              </>
            )}
          </Button>

          <Button
            onClick={onClose}
            className="w-full"
            variant="outline"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
