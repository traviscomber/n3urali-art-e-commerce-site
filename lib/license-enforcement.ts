import { createNeonClient } from "@/lib/neon/client"

export interface LicensePermissions {
  resolution: string
  formats: string[]
  useCases: string[]
  exclusivity: boolean
  resaleRights: boolean
  nftRights: boolean
  downloadLimit: number
  expirationDays?: number
  commercialUse: boolean
  personalUse: boolean
}

export interface LicenseValidationResult {
  valid: boolean
  permissions: LicensePermissions | null
  errors: string[]
  warnings: string[]
}

export interface DownloadRequest {
  orderItemId: string
  userId: string
  userEmail: string
  ipAddress: string
  userAgent: string
  requestedFormat?: string
  intendedUse?: string
}

export class LicenseEnforcement {
  private static instance: LicenseEnforcement
  private sql = createNeonClient()

  public static getInstance(): LicenseEnforcement {
    if (!LicenseEnforcement.instance) {
      LicenseEnforcement.instance = new LicenseEnforcement()
    }
    return LicenseEnforcement.instance
  }

  async validateLicense(licenseId: string): Promise<LicenseValidationResult> {
    try {
      const result = await this.sql`
        SELECT l.*, l.metadata
        FROM licenses l
        WHERE l.id = ${licenseId} AND l.active = true
      `

      if (!result[0]) {
        return {
          valid: false,
          permissions: null,
          errors: ["License not found or inactive"],
          warnings: [],
        }
      }

      const license = result[0]
      const metadata = license.metadata || {}

      const permissions: LicensePermissions = {
        resolution: metadata.resolution || "4096x4096",
        formats: metadata.formats || ["JPG"],
        useCases: metadata.use_cases || ["Personal use"],
        exclusivity: metadata.exclusivity || false,
        resaleRights: metadata.resale_rights || false,
        nftRights: metadata.nft_rights || false,
        downloadLimit: this.getDownloadLimit(license.name),
        expirationDays: this.getExpirationDays(license.name),
        commercialUse: this.isCommercialAllowed(license.name),
        personalUse: true,
      }

      const warnings = this.generateWarnings(license, permissions)

      return {
        valid: true,
        permissions,
        errors: [],
        warnings,
      }
    } catch (error) {
      console.error("License validation error:", error)
      return {
        valid: false,
        permissions: null,
        errors: ["License validation failed"],
        warnings: [],
      }
    }
  }

  async validateDownloadRequest(request: DownloadRequest): Promise<LicenseValidationResult> {
    try {
      // Get order item with license information
      const orderResult = await this.sql`
        SELECT 
          oi.*, 
          o.user_email, 
          o.status as order_status,
          l.name as license_name,
          l.metadata as license_metadata,
          i.title as image_title
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN licenses l ON oi.license_id = l.id
        JOIN images i ON oi.image_id = i.id
        WHERE oi.id = ${request.orderItemId}
      `

      if (!orderResult[0]) {
        return {
          valid: false,
          permissions: null,
          errors: ["Order item not found"],
          warnings: [],
        }
      }

      const orderItem = orderResult[0]
      const errors: string[] = []
      const warnings: string[] = []

      // Validate order status
      if (orderItem.order_status !== "completed") {
        errors.push("Order not completed")
      }

      // Validate user ownership
      if (orderItem.user_email !== request.userEmail) {
        errors.push("User not authorized for this download")
      }

      // Validate download limits
      if (orderItem.download_count >= orderItem.download_limit) {
        errors.push(`Download limit exceeded (${orderItem.download_count}/${orderItem.download_limit})`)
      }

      // Check for expired downloads
      if (orderItem.download_expires_at && new Date(orderItem.download_expires_at) < new Date()) {
        errors.push("Download access has expired")
      }

      // Validate license permissions
      const licenseValidation = await this.validateLicense(orderItem.license_id)
      if (!licenseValidation.valid) {
        errors.push(...licenseValidation.errors)
      }

      // Validate requested format
      if (request.requestedFormat && licenseValidation.permissions) {
        if (!licenseValidation.permissions.formats.includes(request.requestedFormat.toUpperCase())) {
          errors.push(`Format ${request.requestedFormat} not allowed for this license`)
        }
      }

      // Validate intended use
      if (request.intendedUse && licenseValidation.permissions) {
        const isCommercialUse = this.isCommercialUseIntent(request.intendedUse)
        if (isCommercialUse && !licenseValidation.permissions.commercialUse) {
          errors.push("Commercial use not allowed for this license")
        }
      }

      // Check for suspicious activity
      const suspiciousActivity = await this.checkSuspiciousActivity(request)
      if (suspiciousActivity.length > 0) {
        warnings.push(...suspiciousActivity)
      }

      return {
        valid: errors.length === 0,
        permissions: licenseValidation.permissions,
        errors,
        warnings: [...warnings, ...licenseValidation.warnings],
      }
    } catch (error) {
      console.error("Download request validation error:", error)
      return {
        valid: false,
        permissions: null,
        errors: ["Download validation failed"],
        warnings: [],
      }
    }
  }

  async recordLicenseUsage(request: DownloadRequest, licenseId: string, success: boolean): Promise<void> {
    try {
      // Record in download logs
      await this.sql`
        INSERT INTO download_logs (
          order_item_id, 
          image_id, 
          download_token, 
          user_agent, 
          ip_address, 
          downloaded_at,
          success,
          metadata
        )
        VALUES (
          ${request.orderItemId},
          (SELECT image_id FROM order_items WHERE id = ${request.orderItemId}),
          'enforcement-' || gen_random_uuid(),
          ${request.userAgent},
          ${request.ipAddress}::inet,
          NOW(),
          ${success},
          ${JSON.stringify({
            requestedFormat: request.requestedFormat,
            intendedUse: request.intendedUse,
            enforcement: "license-validation",
          })}
        )
      `

      // Update download count if successful
      if (success) {
        await this.sql`
          UPDATE order_items 
          SET download_count = download_count + 1
          WHERE id = ${request.orderItemId}
        `
      }

      // Record license usage analytics
      await this.sql`
        INSERT INTO license_usage_analytics (
          license_id,
          order_item_id,
          user_email,
          usage_type,
          ip_address,
          user_agent,
          success,
          created_at
        )
        VALUES (
          ${licenseId},
          ${request.orderItemId},
          ${request.userEmail},
          'download',
          ${request.ipAddress}::inet,
          ${request.userAgent},
          ${success},
          NOW()
        )
        ON CONFLICT DO NOTHING
      `
    } catch (error) {
      console.error("License usage recording error:", error)
    }
  }

  private getDownloadLimit(licenseName: string): number {
    const limits: Record<string, number> = {
      PRO: 5,
      "PRO+": 10,
      "PRO+ Premium": 15,
      EXCLUSIVE: 25,
      "EXCLUSIVE Premium": 50,
      NON_EXCLUSIVE: 5,
      EXCLUSIVE: 25,
    }
    return limits[licenseName] || 5
  }

  private getExpirationDays(licenseName: string): number | undefined {
    const expirations: Record<string, number> = {
      PRO: 365,
      "PRO+": 730,
      "PRO+ Premium": 1095,
      // EXCLUSIVE licenses don't expire
    }
    return expirations[licenseName]
  }

  private isCommercialAllowed(licenseName: string): boolean {
    const commercialLicenses = ["PRO", "PRO+", "PRO+ Premium", "EXCLUSIVE", "EXCLUSIVE Premium"]
    return commercialLicenses.includes(licenseName)
  }

  private isCommercialUseIntent(intendedUse: string): boolean {
    const commercialKeywords = [
      "commercial",
      "business",
      "profit",
      "sale",
      "marketing",
      "advertising",
      "promotion",
      "client",
      "customer",
      "revenue",
    ]
    return commercialKeywords.some((keyword) => intendedUse.toLowerCase().includes(keyword))
  }

  private generateWarnings(license: any, permissions: LicensePermissions): string[] {
    const warnings: string[] = []

    if (!permissions.exclusivity && permissions.resaleRights) {
      warnings.push("Non-exclusive license with resale rights - ensure compliance with terms")
    }

    if (permissions.nftRights && !permissions.commercialUse) {
      warnings.push("NFT rights granted but commercial use restricted")
    }

    if (permissions.expirationDays && permissions.expirationDays < 365) {
      warnings.push(`License expires in ${permissions.expirationDays} days`)
    }

    return warnings
  }

  private async checkSuspiciousActivity(request: DownloadRequest): Promise<string[]> {
    const warnings: string[] = []

    try {
      // Check for rapid downloads from same IP
      const recentDownloads = await this.sql`
        SELECT COUNT(*) as count
        FROM download_logs
        WHERE ip_address = ${request.ipAddress}::inet
        AND downloaded_at > NOW() - INTERVAL '1 hour'
      `

      if (recentDownloads[0]?.count > 10) {
        warnings.push("High download frequency detected from this IP")
      }

      // Check for downloads from multiple IPs for same user
      const ipCount = await this.sql`
        SELECT COUNT(DISTINCT ip_address) as ip_count
        FROM download_logs dl
        JOIN order_items oi ON dl.order_item_id = oi.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.user_email = ${request.userEmail}
        AND dl.downloaded_at > NOW() - INTERVAL '24 hours'
      `

      if (ipCount[0]?.ip_count > 5) {
        warnings.push("Downloads from multiple IP addresses detected")
      }
    } catch (error) {
      console.error("Suspicious activity check error:", error)
    }

    return warnings
  }
}
