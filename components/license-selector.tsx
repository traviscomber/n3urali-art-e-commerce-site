"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Info, AlertCircle, Crown, Users } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  isImageSoldExclusively?: boolean
}

export function LicenseSelector({
  basePrice,
  selectedLicenseId,
  onLicenseSelect,
  className,
  isImageSoldExclusively = false,
}: LicenseSelectorProps) {
  const [licenses, setLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLicenses()
  }, [])

  useEffect(() => {
    if (licenses.length > 0 && !selectedLicense) {
      // Auto-select non-exclusive license by default
      const defaultLicense = licenses.find((l) => l.name === "Non-Exclusive") || licenses[0]
      if (defaultLicense) {
        handleLicenseSelect(defaultLicense)
      }
    }
  }, [licenses, selectedLicense])

  const fetchLicenses = async () => {
    try {
      setError(null)
      const response = await fetch("/api/licenses")
      if (!response.ok) {
        throw new Error("Failed to fetch licenses")
      }
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to load licenses")
      }

      setLicenses(data.licenses || [])

      if (data.licenses.length === 0) {
        setError("No licenses available. Please contact support.")
      }
    } catch (error) {
      console.error("Error fetching licenses:", error)
      setError("Failed to load license options")
      toast.error("Failed to load license options")

      setLicenses([
        {
          id: "non-exclusive",
          name: "Non-Exclusive",
          description: "Standard commercial license - image can be sold to multiple buyers",
          price: 29.99,
          active: true,
        },
        {
          id: "exclusive",
          name: "Exclusive",
          description: "Exclusive rights - you will be the only buyer of this image",
          price: 199.99,
          active: true,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleLicenseSelect = (license: License) => {
    if (license.name === "Exclusive" && isImageSoldExclusively) {
      toast.error("This image has already been sold exclusively and is no longer available for exclusive purchase.")
      return
    }

    setSelectedLicense(license)
    const totalPrice = license.price
    onLicenseSelect(license, totalPrice)
  }

  const getLicenseIcon = (licenseName: string) => {
    if (licenseName === "Exclusive") return <Crown className="h-4 w-4" />
    return <Users className="h-4 w-4" />
  }

  const getLicenseBadgeColor = (licenseName: string) => {
    if (licenseName === "Exclusive") return "bg-amber-100 text-amber-800 border-amber-200"
    return "bg-blue-100 text-blue-800 border-blue-200"
  }

  const getLicenseTypeIndicator = (licenseName: string) => {
    if (licenseName === "Exclusive") return "One-Time Sale"
    return "Multiple Sales"
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

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isImageSoldExclusively) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Alert>
          <Crown className="h-4 w-4" />
          <AlertDescription>
            This image has been sold exclusively and is no longer available for purchase.
          </AlertDescription>
        </Alert>
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
          .map((license) => {
            const typeIndicator = getLicenseTypeIndicator(license.name)
            const isExclusive = license.name === "Exclusive"
            const isDisabled = isExclusive && isImageSoldExclusively

            return (
              <Card
                key={license.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedLicense?.id === license.id
                    ? "ring-2 ring-primary bg-primary/5"
                    : isDisabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:border-primary/50"
                }`}
                onClick={() => !isDisabled && handleLicenseSelect(license)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getLicenseIcon(license.name)}
                        <h4 className="font-medium">{license.name}</h4>
                        <Badge variant="outline" className={`text-xs ${getLicenseBadgeColor(license.name)}`}>
                          {typeIndicator}
                        </Badge>
                        {selectedLicense?.id === license.id && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{license.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">${license.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• All licenses include high-resolution download (4K-16K)</p>
        <p>• Instant download after payment confirmation</p>
        <p>• 30-day download access with up to 5 downloads per purchase</p>
        <p>
          • <strong>Non-Exclusive:</strong> Standard commercial use, image available to other buyers
        </p>
        <p>
          • <strong>Exclusive:</strong> Full exclusive rights, image removed from sale after purchase
        </p>
      </div>
    </div>
  )
}
