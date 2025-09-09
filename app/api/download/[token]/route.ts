import { type NextRequest, NextResponse } from "next/server"
import { createNeonClient } from "@/lib/neon/client"
import { LicenseEnforcement } from "@/lib/license-enforcement"

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const token = params.token

    if (!token) {
      return NextResponse.json({ error: "Download token is required" }, { status: 400 })
    }

    const sql = createNeonClient()
    const licenseEnforcement = LicenseEnforcement.getInstance()

    const result = await sql`
      SELECT * FROM verify_and_download(${token})
    `

    const downloadData = result[0]

    if (!downloadData?.valid) {
      return NextResponse.json(
        {
          error: "Invalid or expired download token",
        },
        { status: 403 },
      )
    }

    const downloadRequest = {
      orderItemId: downloadData.order_item_id.toString(),
      userId: "system", // Token-based downloads don't have user context
      userEmail: "system@download.token",
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      requestedFormat: request.nextUrl.searchParams.get("format") || undefined,
      intendedUse: request.nextUrl.searchParams.get("use") || undefined,
    }

    // Validate license permissions
    const validation = await licenseEnforcement.validateDownloadRequest(downloadRequest)

    if (!validation.valid) {
      // Record failed attempt
      await licenseEnforcement.recordLicenseUsage(downloadRequest, downloadData.license_id || "", false)

      return NextResponse.json(
        {
          error: "License validation failed",
          details: validation.errors,
          warnings: validation.warnings,
        },
        { status: 403 },
      )
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      console.warn("[v0] Download warnings:", validation.warnings)
    }

    // Get image and license information
    const imageResult = await sql`
      SELECT i.image_url, i.thumbnail_url, i.title, i.metadata, oi.license_id, l.name as license_name
      FROM images i
      JOIN order_items oi ON i.id = oi.image_id
      JOIN licenses l ON oi.license_id = l.id
      WHERE i.id = ${downloadData.image_id} AND oi.id = ${downloadData.order_item_id}
    `

    if (!imageResult[0]) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    const image = imageResult[0]

    let fileUrl = image.image_url
    let filename = `${image.title.replace(/[^a-zA-Z0-9]/g, "_")}_${image.license_name.toLowerCase()}`

    // Apply license-based file selection
    if (validation.permissions) {
      // For non-exclusive licenses, serve appropriate resolution
      if (!validation.permissions.exclusivity && image.license_name === "NON_EXCLUSIVE") {
        fileUrl = image.thumbnail_url || image.image_url
        filename += "_standard"
      } else {
        filename += "_full"
      }

      // Add format extension based on permissions
      const allowedFormats = validation.permissions.formats
      const requestedFormat = downloadRequest.requestedFormat?.toUpperCase()

      if (requestedFormat && allowedFormats.includes(requestedFormat)) {
        filename += `.${requestedFormat.toLowerCase()}`
      } else {
        filename += ".jpg" // Default format
      }
    } else {
      filename += ".jpg"
    }

    // Fetch and serve the file
    const fileResponse = await fetch(fileUrl)

    if (!fileResponse.ok) {
      console.error(`Failed to fetch file from ${fileUrl}:`, fileResponse.status)
      await licenseEnforcement.recordLicenseUsage(downloadRequest, image.license_id, false)
      return NextResponse.json({ error: "File not accessible" }, { status: 404 })
    }

    const fileBuffer = await fileResponse.arrayBuffer()

    // Record successful download
    await licenseEnforcement.recordLicenseUsage(downloadRequest, image.license_id, true)

    // Set headers with license information
    const headers = new Headers()
    headers.set("Content-Disposition", `attachment; filename="${filename}"`)
    headers.set("Content-Type", fileResponse.headers.get("content-type") || "application/octet-stream")
    headers.set("Content-Length", fileBuffer.byteLength.toString())
    headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    headers.set("Pragma", "no-cache")
    headers.set("Expires", "0")
    headers.set("X-License-Type", image.license_name)
    headers.set("X-License-Permissions", JSON.stringify(validation.permissions))

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
