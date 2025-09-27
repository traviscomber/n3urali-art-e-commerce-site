"use client"

import type React from "react"

import { useState } from "react"
import { useCart } from "@/lib/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Wallet, Lock, ShoppingCart, CheckCircle, Copy, QrCode } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

type CryptoCurrency = {
  symbol: string
  name: string
  address: string
  icon: string
  rate: number // USD to crypto rate
}

const supportedCryptos: CryptoCurrency[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    icon: "₿",
    rate: 0.000023, // Example rate: 1 USD = 0.000023 BTC
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
    icon: "Ξ",
    rate: 0.00041, // Example rate: 1 USD = 0.00041 ETH
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
    icon: "$",
    rate: 1.0, // 1:1 with USD
  },
]

function CryptoPaymentForm({
  items,
  total,
  onSuccess,
  onError,
}: {
  items: any[]
  total: number
  onSuccess: () => void
  onError: (error: string) => void
}) {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrency>(supportedCryptos[0])
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<"select" | "pay" | "confirm">("select")
  const [transactionHash, setTransactionHash] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const cryptoAmount = (total * 1.03 * selectedCrypto.rate).toFixed(8)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleContinueToPayment = () => {
    if (!formData.email || !formData.firstName || !formData.lastName) {
      onError("Please fill in all required fields")
      return
    }
    setPaymentStep("pay")
  }

  const handleConfirmPayment = async () => {
    if (!transactionHash.trim()) {
      onError("Please enter your transaction hash")
      return
    }

    setIsProcessing(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create order record with crypto payment info
      const orderResponse = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          total,
          customerInfo: formData,
          paymentMethod: "crypto",
          cryptoDetails: {
            currency: selectedCrypto.symbol,
            amount: cryptoAmount,
            transactionHash: transactionHash,
            address: selectedCrypto.address,
          },
        }),
      })

      const orderResult = await orderResponse.json()

      if (orderResult.success) {
        console.log("[v0] Crypto order created successfully:", orderResult.data.orderNumber)
        onSuccess()
      } else {
        console.error("[v0] Order creation failed:", orderResult.error)
        onError(orderResult.error || "Failed to create order")
      }
    } catch (error) {
      console.error("[v0] Crypto payment processing error:", error)
      onError("Payment processing failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (paymentStep === "select") {
    return (
      <div className="space-y-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
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
                <Label htmlFor="lastName">Last Name</Label>
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

        {/* Crypto Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Select Cryptocurrency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {supportedCryptos.map((crypto) => (
                <div
                  key={crypto.symbol}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedCrypto.symbol === crypto.symbol
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedCrypto(crypto)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{crypto.icon}</div>
                      <div>
                        <div className="font-medium">{crypto.name}</div>
                        <div className="text-sm text-muted-foreground">{crypto.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {(total * 1.03 * crypto.rate).toFixed(8)} {crypto.symbol}
                      </div>
                      <div className="text-sm text-muted-foreground">${(total * 1.03).toFixed(2)} USD</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleContinueToPayment} size="lg" className="w-full glow-primary">
          Continue to Payment
        </Button>
      </div>
    )
  }

  if (paymentStep === "pay") {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Send Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-lg font-medium">
                Send exactly{" "}
                <span className="font-bold text-primary">
                  {cryptoAmount} {selectedCrypto.symbol}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">to the following address:</div>
            </div>

            <div className="space-y-3">
              <Label>Wallet Address</Label>
              <div className="flex items-center gap-2">
                <Input value={selectedCrypto.address} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(selectedCrypto.address)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="font-medium text-sm">Payment Details:</div>
              <div className="text-sm space-y-1">
                <div>
                  Amount: {cryptoAmount} {selectedCrypto.symbol}
                </div>
                <div>Network: {selectedCrypto.symbol === "BTC" ? "Bitcoin" : "Ethereum"}</div>
                <div>Confirmations required: {selectedCrypto.symbol === "BTC" ? "1" : "12"}</div>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="txHash">Transaction Hash</Label>
              <Input
                id="txHash"
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
                placeholder="Enter transaction hash after sending payment"
              />
              <p className="text-xs text-muted-foreground">
                After sending the payment, paste the transaction hash here to confirm your order.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setPaymentStep("select")} className="flex-1">
            Back
          </Button>
          <Button
            onClick={handleConfirmPayment}
            disabled={isProcessing || !transactionHash.trim()}
            size="lg"
            className="flex-1 glow-primary"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Verifying...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Confirm Payment
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          This is a demo system. In production, payment verification would be automated via blockchain APIs.
        </p>
      </div>
    )
  }

  return null
}

export default function CheckoutPage() {
  const { items, total, clearCart, updateQuantity } = useCart()
  const router = useRouter()
  const [orderComplete, setOrderComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const getLicenseBadgeColor = (license: string) => {
    switch (license) {
      case "standard":
        return "bg-secondary text-secondary-foreground"
      case "extended":
        return "bg-primary text-primary-foreground"
      case "commercial":
        return "bg-accent text-accent-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const handlePaymentSuccess = () => {
    clearCart()
    setOrderComplete(true)
  }

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage)
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
            <h1 className="text-2xl font-bold mb-2">Order Complete!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your purchase. You'll receive download links via email shortly.
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
          <h1 className="text-3xl font-bold">Crypto Checkout</h1>
          <p className="text-muted-foreground mt-2">Pay with Bitcoin, Ethereum, or USDC</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={() => setError(null)} className="mt-2">
              Try Again
            </Button>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="lg:order-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={item.previewUrl || "/placeholder.svg?height=64&width=64"}
                        alt={item.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={`text-xs ${getLicenseBadgeColor(item.licenseType)}`}>
                          {item.licenseType}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-6 w-6 p-0"
                          >
                            -
                          </Button>
                          <span className="text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-6 w-6 p-0"
                          >
                            +
                          </Button>
                        </div>
                        <p className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Processing Fee</span>
                    <span>{formatPrice(total * 0.03)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(total * 1.03)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="lg:order-1">
            <CryptoPaymentForm
              items={items}
              total={total}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
