"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type React from "react"
import { useState } from "react"
import { useCart } from "@/lib/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ShoppingCart, CheckCircle, Copy, Check, Send, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

const USDT_WALLET_ADDRESS = process.env.NEXT_PUBLIC_USDT_WALLET_ADDRESS || "TJ1iodaRdVm5e7yKLy3Uck3dw1iKDbmJ4a"
const USDT_RATE = 1.0 // 1 USD = 1 USDT

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const [orderComplete, setOrderComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [copied, setCopied] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const usdtAmount = (total * USDT_RATE).toFixed(2)

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConfirmPayment = async () => {
    if (!formData.email || !formData.firstName || !formData.lastName) {
      setError("Please fill in all contact information")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Create order with USDT payment info
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          total,
          customerInfo: {
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
          },
          paymentMethod: "crypto",
          cryptoDetails: {
            currency: "USDT",
            network: "TRC20",
            amount: usdtAmount,
            address: USDT_WALLET_ADDRESS,
          },
        }),
      })

      const result = await response.json()

      if (result.success) {
        clearCart()
        setOrderComplete(true)
      } else {
        setError(result.error || "Failed to create order")
      }
    } catch (error) {
      console.error("[v0] Payment processing error:", error)
      setError("Payment processing failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Redirect if cart is empty and order not complete
  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto" />
          <div>
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Add some amazing 360° images to get started</p>
            <Link href="/gallery">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Order complete state
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <div>
            <h1 className="text-2xl font-bold mb-2">Order Submitted!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your order. After sending the USDT payment, our team will verify the transaction and send
              your download links via email within 5-10 minutes.
            </p>
            <div className="space-y-3">
              <Link href="/gallery">
                <Button className="w-full">Continue Shopping</Button>
              </Link>
              <Link href="/account/orders">
                <Button variant="outline" className="w-full bg-transparent">
                  View My Orders
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/gallery" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
          <h1 className="text-3xl font-bold">Deposit USDT</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={() => setError(null)} className="mt-2">
              Dismiss
            </Button>
          </div>
        )}

        <div className="max-w-xl mx-auto space-y-6">
          {/* Order Summary Card */}
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Package</div>
                  <div className="font-semibold">{items.length === 1 ? items[0].title : `${items.length} Images`}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    You will receive {items.reduce((sum, item) => sum + item.quantity, 0)} image
                    {items.reduce((sum, item) => sum + item.quantity, 0) > 1 ? "s" : ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">Amount</div>
                  <div className="text-2xl font-bold">${usdtAmount} USDT</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-6">
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg">
                  <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${USDT_WALLET_ADDRESS}`}
                    alt="USDT Wallet QR Code"
                    width={200}
                    height={200}
                    className="rounded"
                  />
                </div>
              </div>

              {/* Network Badge */}
              <div>
                <div className="text-sm text-muted-foreground mb-2">Network</div>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  <span className="font-mono font-semibold mr-2">TRX</span>
                  Tron (TRC20)
                </Badge>
              </div>

              {/* Deposit Address */}
              <div>
                <div className="text-sm text-muted-foreground mb-2">Deposit Address</div>
                <div className="flex items-center gap-2">
                  <Input value={USDT_WALLET_ADDRESS} readOnly className="font-mono text-sm bg-muted/50" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(USDT_WALLET_ADDRESS)}
                    className="flex-shrink-0"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm space-y-1">
                    <p className="font-medium text-blue-500 dark:text-blue-400">Important:</p>
                    <p className="text-foreground">
                      Send exactly <span className="font-semibold">${usdtAmount} USDT</span> to the address above using
                      the <span className="font-semibold">Tron (TRC20)</span> network. Credits will be added to your
                      account after confirmation (usually 5-10 minutes).
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                />
                <p className="text-xs text-muted-foreground mt-1">Download links will be sent here</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleConfirmPayment}
            disabled={isProcessing || !formData.email || !formData.firstName || !formData.lastName}
            size="lg"
            className="w-full"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Confirm Payment
              </>
            )}
          </Button>

          <div className="text-center space-y-2 text-sm text-muted-foreground">
            <p>After sending payment, click the button above to notify the admin for faster processing.</p>
            <p>Having issues? Contact support with your transaction hash.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
