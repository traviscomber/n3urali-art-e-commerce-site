import { NextResponse } from "next/server"
import { BackblazeAuth } from "@/lib/backblaze-auth"

export async function GET() {
  try {
    const backblaze = new BackblazeAuth()
    const config = backblaze.getConfig()

    // Test connection
    const connectionTest = await backblaze.testConnection()

    return NextResponse.json({
      success: true,
      config: {
        accessKeyId: config.accessKeyId.substring(0, 8) + "...",
        bucket: config.bucket,
        region: config.region,
        endpoint: config.endpoint,
      },
      connectionTest,
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
