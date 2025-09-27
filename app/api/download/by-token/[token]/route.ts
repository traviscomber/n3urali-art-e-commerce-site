import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ImageUrlHandler } from "@/lib/image-url-handler"

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    console.log("[v0] Download verification started")
    const token = params.token
    console.log("[v0] Received token:", token)

    if (!token) {
      console.log("[v0] Missing download token")
      return NextResponse.json({ error: "Download token is required" }, { status: 400 })
    }

    console.log("[v0] Creating Supabase client...")
    const supabase = await createClient()
    console.log("[v0] Supabase client created successfully")

    console.log("[v0] Verifying download token...")
    const { data: downloadData, error: verifyError } = await supabase
      .from("downloads")
      .select(`
        *,
        images!inner(id, image_url, title),
        orders!inner(id, status)
      `)
      .eq("download_token", token)
      .gt("expires_at", new Date().toISOString())
      .eq("orders.status", "completed")
      .single()

    if (verifyError || !downloadData) {
      console.log("[v0] Invalid or expired token")
      return NextResponse.json(
        {
          error: "Invalid or expired download token",
        },
        { status: 403 },
      )
    }

    console.log("[v0] Token verified successfully")

    const originalImageUrl = downloadData.images.image_url
    const imageTitle = downloadData.images.title

    const downloadUrl = ImageUrlHandler.convertToDownloadUrl(originalImageUrl)
    console.log("[v0] Converted URL for download:", downloadUrl)

    try {
      console.log("[v0] Fetching image from:", downloadUrl)

      // Create headers for the fetch request (in case authentication is needed)
      const fetchHeaders: HeadersInit = {
        "User-Agent": "N3urali-Download-Service/1.0",
      }

      // Add Backblaze authentication if needed
      if (ImageUrlHandler.getStorageProvider(originalImageUrl) === "backblaze") {
        // For Backblaze, we might need to add authorization headers in the future
        console.log("[v0] Fetching from Backblaze storage")
      }

      // Fetch the image from the storage URL
      const imageResponse = await fetch(downloadUrl, {
        headers: fetchHeaders,
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })

      if (!imageResponse.ok) {
        console.error("[v0] Failed to fetch image:", imageResponse.status, imageResponse.statusText)

        // Try fallback to original URL if conversion failed
        if (downloadUrl !== originalImageUrl) {
          console.log("[v0] Trying fallback to original URL:", originalImageUrl)
          const fallbackResponse = await fetch(originalImageUrl, {
            headers: fetchHeaders,
            signal: AbortSignal.timeout(30000),
          })

          if (fallbackResponse.ok) {
            const fallbackBuffer = await fallbackResponse.arrayBuffer()
            return createDownloadResponse(fallbackBuffer, imageTitle, fallbackResponse.headers.get("content-type"))
          }
        }

        return NextResponse.json({ error: "Failed to retrieve image file" }, { status: 500 })
      }

      const imageBuffer = await imageResponse.arrayBuffer()
      console.log("[v0] Image fetched successfully, size:", imageBuffer.byteLength, "bytes")

      return createDownloadResponse(imageBuffer, imageTitle, imageResponse.headers.get("content-type"))
    } catch (fetchError) {
      console.error("[v0] Error fetching image file:", fetchError)

      // Fallback to redirect if direct serving fails
      console.log("[v0] Falling back to redirect for:", downloadUrl)
      return NextResponse.redirect(downloadUrl)
    }
  } catch (error) {
    console.error("[v0] Download error:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function createDownloadResponse(
  imageBuffer: ArrayBuffer,
  imageTitle: string,
  contentType: string | null,
): NextResponse {
  const headers = new Headers()
  headers.set("Content-Type", contentType || "image/jpeg")
  headers.set("Content-Disposition", `attachment; filename="${sanitizeFilename(imageTitle)}.jpg"`)
  headers.set("Content-Length", imageBuffer.byteLength.toString())
  headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
  headers.set("Pragma", "no-cache")
  headers.set("Expires", "0")

  console.log("[v0] Serving secure download for:", imageTitle)
  return new NextResponse(imageBuffer, { headers })
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9\-_\s]/g, "") // Remove special characters
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .substring(0, 100) // Limit length
}
