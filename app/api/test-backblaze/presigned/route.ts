import { NextResponse } from "next/server"
import { generatePresignedUrl } from "@/lib/s3-manual"

export async function GET() {
  try {
    const bucket = process.env.BACKBLAZE_BUCKET_NAME!
    const testKey = `test-${Date.now()}.txt`

    const presignedUrl = await generatePresignedUrl(
      bucket,
      testKey,
      "text/plain",
      300, // 5 minutes
    )

    // Validate that the URL is properly formed
    new URL(presignedUrl) // This will throw if invalid

    return NextResponse.json({
      success: true,
      message: "Successfully generated presigned URL",
      details: {
        bucket,
        key: testKey,
        url: presignedUrl.substring(0, 100) + "...", // Truncate for security
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Failed to generate presigned URL: ${error instanceof Error ? error.message : "Unknown error"}`,
    })
  }
}
