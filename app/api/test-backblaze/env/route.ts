import { NextResponse } from "next/server"

export async function GET() {
  try {
    const requiredVars = ["BACKBLAZE_KEY_ID", "BACKBLAZE_APPLICATION_KEY", "BACKBLAZE_BUCKET_NAME"]

    const optionalVars = ["B2_REGION", "B2_ENDPOINT"]

    const missing = requiredVars.filter((varName) => !process.env[varName])
    const present = requiredVars.filter((varName) => process.env[varName])
    const optional = optionalVars.map((varName) => ({
      name: varName,
      present: !!process.env[varName],
      value: process.env[varName] || "not set",
    }))

    if (missing.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Missing required environment variables: ${missing.join(", ")}`,
        details: { missing, present, optional },
      })
    }

    return NextResponse.json({
      success: true,
      message: `All required environment variables are present: ${present.join(", ")}`,
      details: {
        present,
        optional,
        bucketName: process.env.BACKBLAZE_BUCKET_NAME,
        region: process.env.B2_REGION || "us-east-005 (default)",
        endpoint: process.env.B2_ENDPOINT || "https://s3.us-east-005.backblazeb2.com (default)",
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Error checking environment variables: ${error instanceof Error ? error.message : "Unknown error"}`,
    })
  }
}
