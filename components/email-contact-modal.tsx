"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mail, Copy, Check } from "lucide-react"

interface EmailContactModalProps {
  isOpen: boolean
  onClose: () => void
}

export function EmailContactModal({ isOpen, onClose }: EmailContactModalProps) {
  const [copied, setCopied] = useState(false)
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
            Contact Us
          </DialogTitle>
          <DialogDescription>
            Get in touch with N3uralia360
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Email Display */}
          <div className="bg-background border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Email Address</p>
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
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quotation Request Guide */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Request a Quotation</p>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              When requesting a quotation for our services or products, please include:
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-disc list-inside">
              <li>Project type (dome installation, VR environment, spatial media, etc.)</li>
              <li>Venue size and specifications</li>
              <li>Timeline and budget range (if applicable)</li>
              <li>Your contact information and preferred communication method</li>
              <li>Any reference images, inspiration, or detailed requirements</li>
            </ul>
            <p className="text-xs text-blue-700 dark:text-blue-300 pt-2">
              Our team will provide a tailored quotation within 24-48 hours.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold">How to Contact Us</p>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Copy the email address above</li>
              <li>Open your preferred email client (Gmail, Outlook, Apple Mail, etc.)</li>
              <li>Paste the email address in the "To" field</li>
              <li>Write your message with the details above and send</li>
            </ol>
            <p className="text-xs text-muted-foreground pt-2">
              We typically respond within 24 hours during business days.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">Why use your email client?</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Use any email provider (Gmail, Outlook, Apple Mail, etc.)</li>
              <li>✓ Maintain your email history and sent messages</li>
              <li>✓ Faster response and better communication</li>
              <li>✓ Your privacy and security</li>
            </ul>
          </div>
        </div>

        {/* Close Button */}
        <Button onClick={onClose} className="w-full mt-4">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  )
}
