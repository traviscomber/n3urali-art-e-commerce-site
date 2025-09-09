import { type NextRequest, NextResponse } from "next/server"
import { WorkingBackblazeStorage } from "@/lib/backblaze-working"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Setting up Backblaze CORS configuration...")

    const storage = new WorkingBackblazeStorage()

    // Get authentication details
    const authInfo = await storage.getAuthInfo()
    console.log("[v0] Got Backblaze auth info:", {
      hasApiUrl: !!authInfo.apiUrl,
      hasAuthToken: !!authInfo.authToken,
      hasAccountId: !!authInfo.accountId,
    })

    const bucketId = await storage.getBucketIdPublic()
    console.log("[v0] Got bucket ID:", bucketId)

    // Configure CORS rules for image access
    const corsRules = [
      {
        corsRuleName: "allowImageAccess",
        allowedOrigins: ["*"], // Allow all origins for now
        allowedHeaders: ["range", "authorization", "x-bz-content-sha1"],
        allowedOperations: ["b2_download_file_by_name", "b2_download_file_by_id"],
        exposeHeaders: ["x-bz-content-sha1", "x-bz-file-name"],
        maxAgeSeconds: 3600,
      },
    ]

    console.log("[v0] Updating bucket CORS rules...")

    // Update bucket with CORS rules
    const updateResponse = await fetch(`${authInfo.apiUrl}/b2api/v3/b2_update_bucket`, {
      method: "POST",
      headers: {
        Authorization: authInfo.authToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountId: authInfo.accountId,
        bucketId: bucketId,
        corsRules: corsRules,
      }),
    })

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text()
      console.error("[v0] CORS update failed:", errorText)
      throw new Error(`Failed to update CORS: ${updateResponse.status} - ${errorText}`)
    }

    const result = await updateResponse.json()
    console.log("[v0] CORS configuration updated successfully")

    return NextResponse.json({
      success: true,
      message: "CORS configuration updated successfully",
      corsRules: result.corsRules,
    })
  } catch (error) {
    console.error("[v0] CORS setup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const storage = new WorkingBackblazeStorage()
    const authInfo = await storage.getAuthInfo()
    const bucketId = await storage.getBucketIdPublic()

    // Get current bucket info including CORS rules
    const response = await fetch(`${authInfo.apiUrl}/b2api/v3/b2_list_buckets`, {
      method: "POST",
      headers: {
        Authorization: authInfo.authToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountId: authInfo.accountId,
        bucketId: bucketId,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to get bucket info: ${response.status}`)
    }

    const result = await response.json()
    const bucket = result.buckets?.[0]

    return NextResponse.json({
      success: true,
      bucketName: bucket?.bucketName,
      corsRules: bucket?.corsRules || [],
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
