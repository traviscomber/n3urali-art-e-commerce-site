"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, Clock, DollarSign, User, Mail, Calendar, Package } from 'lucide-react'
import { toast } from "sonner"
import { getPendingPayments, approvePayment, rejectPayment, type PendingPayment } from "@/app/actions/payment-actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ApprovedPaymentData {
  orderId: string
  downloadTokens: string[]
  customerEmail: string
}

export function PaymentsManager() {
  const [payments, setPayments] = useState<PendingPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [approvedPaymentData, setApprovedPaymentData] = useState<ApprovedPaymentData | null>(null)
  const [downloadLinksDialogOpen, setDownloadLinksDialogOpen] = useState(false)

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    setLoading(true)
    const result = await getPendingPayments()
    if (result.success) {
      setPayments(result.data)
    } else {
      toast.error("Failed to load pending payments")
    }
    setLoading(false)
  }

  const handleApprove = async (payment: PendingPayment) => {
    if (!confirm(`Approve payment of $${payment.total_amount} from ${payment.user_email}?`)) {
      return
    }

    setProcessingId(payment.id)
    console.log("[v0] Starting approval process for payment:", payment.id)
    
    const result = await approvePayment(payment.id)
    console.log("[v0] Approval result:", JSON.stringify(result, null, 2))

    if (result.success && "data" in result && result.data) {
      console.log("[v0] Download links received:", result.data.downloadLinks?.length || 0)
      
      toast.success(`Payment approved! Download links generated for ${payment.user_email}`)

      const downloadLinks = result.data.downloadLinks || []
      
      console.log("[v0] Building WhatsApp message with", downloadLinks.length, "links")

      const linksText = downloadLinks
        .map((link: any, index: number) => {
          // The url property contains the full download URL
          console.log("[v0] Link", index + 1, ":", { title: link.imageTitle, url: link.url })
          return `${index + 1}. ${link.imageTitle}\n   ${link.url}`
        })
        .join("\n\n")

      console.log("[v0] Generated links text:\n", linksText)

      const message = `✅ Payment Approved - Download Links Ready

Customer: ${result.data.customerName}
Email: ${result.data.customerEmail}
Amount: $${result.data.totalAmount} USDT

📥 High-Resolution Download Links:

${linksText}

⏱️ Links expire in 1 year
🔄 Up to 10 downloads per image

Please forward these links to the customer.`

      console.log("[v0] Full WhatsApp message:\n", message)
      console.log("[v0] WhatsApp message length:", message.length, "characters")

      const whatsappUrl = `https://wa.me/56940946660?text=${encodeURIComponent(message)}`
      console.log("[v0] WhatsApp URL length:", whatsappUrl.length, "characters")
      console.log("[v0] Opening WhatsApp...")
      
      window.open(whatsappUrl, "_blank")

      await loadPayments()
    } else {
      const errorMsg = !result.success && "error" in result ? result.error : "Unknown error"
      console.error("[v0] Approval failed:", errorMsg)
      toast.error("Failed to approve payment: " + errorMsg)
    }
    setProcessingId(null)
  }

  const copyDownloadLinks = () => {
    if (!approvedPaymentData) return

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    const links = approvedPaymentData.downloadTokens
      .map((token, index) => `${index + 1}. ${baseUrl}/api/download/by-token/${token}`)
      .join("\n")

    const message = `Hi ${approvedPaymentData.customerEmail},

Your payment has been approved! Here are your download links for the high-resolution images:

${links}

These links will expire in 1 year. You can download each image up to 10 times.

Thank you for your purchase!`

    navigator.clipboard.writeText(message)
    toast.success("Download links copied to clipboard!")
  }

  const copyIndividualLink = (token: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    const link = `${baseUrl}/api/download/by-token/${token}`
    navigator.clipboard.writeText(link)
    toast.success("Link copied!")
  }

  const handleRejectClick = (payment: PendingPayment) => {
    setSelectedPayment(payment)
    setRejectDialogOpen(true)
  }

  const handleRejectConfirm = async () => {
    if (!selectedPayment) return

    setProcessingId(selectedPayment.id)
    const result = await rejectPayment(selectedPayment.id, rejectReason)

    if (result.success) {
      toast.success("Payment rejected")
      await loadPayments()
      setRejectDialogOpen(false)
      setRejectReason("")
      setSelectedPayment(null)
    } else {
      toast.error("Failed to reject payment: " + result.error)
    }
    setProcessingId(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-lg">Loading pending payments...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <DollarSign className="h-6 w-6" />
            Pending Payments ({payments.length})
          </CardTitle>
          <CardDescription className="text-lg">Review and approve USDT payments from customers</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-lg">
                No pending payments. All payments have been processed!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <Card key={payment.id} className="border-2">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-sm">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                            <Badge variant="outline" className="text-sm">
                              {payment.payment_method.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(payment.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${payment.total_amount.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">USDT</p>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Customer
                          </p>
                          <p className="font-medium">{payment.user_name}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            Email
                          </p>
                          <p className="font-medium text-sm">{payment.user_email}</p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          Order Items ({payment.items.length})
                        </p>
                        <div className="space-y-1">
                          {payment.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm p-2 bg-muted/30 rounded">
                              <span className="truncate">{item.image_title}</span>
                              <span className="font-medium">${item.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Transaction Hash */}
                      {payment.transaction_hash && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <p className="text-sm font-medium mb-1">Transaction Hash</p>
                          <p className="text-xs font-mono break-all text-muted-foreground">
                            {payment.transaction_hash}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleApprove(payment)}
                          disabled={processingId === payment.id}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {processingId === payment.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve & Generate Links
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleRejectClick(payment)}
                          disabled={processingId === payment.id}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this payment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for rejection (optional)</Label>
              <Textarea
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} className="bg-transparent">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm} disabled={processingId !== null}>
              {processingId ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
