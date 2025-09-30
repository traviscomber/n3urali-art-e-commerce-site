"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Info, Crown, Users, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface License {
  id: string
  name: string
  description: string
  price: number
  active: boolean
}

interface LicenseSelectorProps {
  basePrice: number
  selectedLicenseId?: string
  onLicenseSelect: (license: License, totalPrice: number) => void
  className?: string
}

export function LicenseSelector({ basePrice, selectedLicenseId, onLicenseSelect, className }: LicenseSelectorProps) {
  const [licenses, setLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null)

  useEffect(() => {
    fetchLicenses()
  }, [])

  useEffect(() => {
    if (licenses.length > 0 && !selectedLicense) {
      const defaultLicense = licenses.find((l) => l.name.toLowerCase().includes("non-exclusive")) || licenses[0]
      if (defaultLicense) {
        handleLicenseSelect(defaultLicense)
      }
    }
  }, [licenses, selectedLicense])

  const fetchLicenses = async () => {
    try {
      const response = await fetch("/api/licenses")
      if (!response.ok) {
        throw new Error("Failed to fetch licenses")
      }
      const data = await response.json()
      setLicenses(data.licenses || [])
    } catch (error) {
      console.error("[v0] Error fetching licenses:", error)
      toast.error("Failed to load license options")
      setLicenses([
        {
          id: "non-exclusive",
          name: "Non-Exclusive",
          description: "Standard commercial and personal use license. Image remains available for others to purchase.",
          price: 1.0,
          active: true,
        },
        {
          id: "exclusive",
          name: "Exclusive",
          description:
            "Exclusive rights license. Image will be removed from marketplace after purchase. Full commercial rights included.",
          price: 3.0,
          active: true,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleLicenseSelect = (license: License) => {
    setSelectedLicense(license)
    const totalPrice = basePrice * license.price
    onLicenseSelect(license, totalPrice)
  }

  const getLicenseIcon = (licenseName: string) => {
    const name = licenseName.toLowerCase()
    if (name.includes("exclusive")) return <Crown className="h-4 w-4" />
    return <Users className="h-4 w-4" />
  }

  const getLicenseBadgeColor = (licenseName: string) => {
    const name = licenseName.toLowerCase()
    if (name.includes("exclusive")) return "bg-amber-100 text-amber-800 border-amber-200"
    return "bg-blue-100 text-blue-800 border-blue-200"
  }

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">License Type</h3>
          <Info className="h-4 w-4 text-muted-foreground" />
        </div>
        <Link
          href="/licensing-terms"
          target="_blank"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          View Full Terms
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {licenses
          .filter((l) => l.active)
          .map((license) => (
            <Card
              key={license.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedLicense?.id === license.id ? "ring-2 ring-primary bg-primary/5" : "hover:border-primary/50"
              }`}
              onClick={() => handleLicenseSelect(license)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getLicenseIcon(license.name)}
                      <h4 className="font-medium">{license.name}</h4>
                      <Badge className={getLicenseBadgeColor(license.name)} variant="outline">
                        {license.price === 1 ? "1x" : `${license.price}x`}
                      </Badge>
                      {selectedLicense?.id === license.id && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{license.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-primary">
                        ${(basePrice * license.price).toFixed(2)}
                      </span>
                      {license.price > 1 && (
                        <span className="text-xs text-muted-foreground">{license.price}x base price</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}
