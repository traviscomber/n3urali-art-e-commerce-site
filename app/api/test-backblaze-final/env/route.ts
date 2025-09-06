import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const requiredEnvVars = {
      BACKBLAZE_API_KEY: process.env.BACKBLAZE_API_KEY,
      BACKBLAZE_APPLICATION_KEY: process.env.BACKBLAZE_APPLICATION_KEY,
      BACKBLAZE_BUCKET_NAME: process.env.BACKBLAZE_BUCKET_NAME,
      B2_REGION: process.env.B2_REGION || "us-east-005",
      B2_ENDPOINT: process.env.B2_ENDPOINT || "https://s3.us-east-005.backblazeb2.com",
    }

    const missing = Object.entries(requiredEnvVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key)

    if (missing.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing environment variables: ${missing.join(", ")}`,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        hasApiKey: !!requiredEnvVars.BACKBLAZE_API_KEY,
        hasApplicationKey: !!requiredEnvVars.BACKBLAZE_APPLICATION_KEY,
        bucketName: requiredEnvVars.BACKBLAZE_BUCKET_NAME,
        region: requiredEnvVars.B2_REGION,
        endpoint: requiredEnvVars.B2_ENDPOINT,
      },
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    })
  }
}
