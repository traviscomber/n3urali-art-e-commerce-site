"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Info } from "lucide-react"
import { toast } from "sonner"

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
      // Auto-select first license if none selected
      const defaultLicense = licenses.find((l) => l.name.toLowerCase().includes("standard")) || licenses[0]
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
      // Fallback to default licenses
      setLicenses([
        {
          id: "standard",
          name: "Standard License",
          description: "Personal and commercial use, up to 500,000 print copies",
          price: 1.0,
          active: true,
        },
        {
          id: "extended",
          name: "Extended License",
          description: "Unlimited print copies, digital products, and resale rights",
          price: 2.5,
          active: true,
        },
        {
          id: "commercial",
          name: "Commercial License",
          description: "Full commercial rights including merchandise and advertising",
          price: 5.0,
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

  const getLicenseBadgeColor = (licenseName: string) => {
    const name = licenseName.toLowerCase()
    if (name.includes("standard")) return "bg-secondary text-secondary-foreground"
    if (name.includes("extended")) return "bg-primary text-primary-foreground"
    if (name.includes("commercial")) return "bg-accent text-accent-foreground"
    return "bg-muted text-muted-foreground"
  }

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
        {[...Array(3)].map((_, i) => (
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
      <div className="flex items-center gap-2">
        <h3 className="font-semibold">License Type</h3>
        <Info className="h-4 w-4 text-muted-foreground" />
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
                      <h4 className="font-medium">{license.name}</h4>
                      <Badge className={getLicenseBadgeColor(license.name)} variant="secondary">
                        {license.price}x
                      </Badge>
                      {selectedLicense?.id === license.id && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{license.description}</p>
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
