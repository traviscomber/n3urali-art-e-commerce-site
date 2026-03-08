import { CheckoutClient } from "@/components/checkout-client"

export const dynamic = 'force-dynamic'

const USDT_WALLET_ADDRESS = process.env.NEXT_PUBLIC_USDT_WALLET_ADDRESS || "TJ1iodaRdVm5e7yKLy3Uck3dw1iKDbmJ4a"
const USDT_RATE = 1.0 // 1 USD = 1 USDT
const WHATSAPP_PHONE = "56940946660"

export default function CheckoutPage() {
  return <CheckoutClient 
    walletAddress={USDT_WALLET_ADDRESS}
    rate={USDT_RATE}
    whatsappPhone={WHATSAPP_PHONE}
  />
}
