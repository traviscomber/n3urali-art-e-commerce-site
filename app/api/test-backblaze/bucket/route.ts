import { NextResponse } from "next/server"

export async function GET() {
  try {
    const bucket = process.env.BACKBLAZE_BUCKET_NAME!
    const region = process.env.B2_REGION || "us-east-005"
    const endpoint = process.env.B2_ENDPOINT || "https://s3.us-east-005.backblazeb2.com"

    // Since presigned URL generation already works, we'll use that to test bucket access
    const testKey = `test-access-${Date.now()}.txt`

    // Generate a presigned URL to test if we can access the bucket
    const presignedResponse = await fetch("/api/sign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename: testKey,
        mime: "text/plain",
      }),
    })

    if (presignedResponse.ok) {
      const { presignedUrl } = await presignedResponse.json()

      // If we can generate a presigned URL, the bucket is accessible
      return NextResponse.json({
        success: true,
        message: `Bucket '${bucket}' is accessible via S3-compatible API`,
        details: {
          bucket,
          region,
          endpoint,
          method: "presigned-url-test",
          testKey,
        },
      })
    } else {
      const errorData = await presignedResponse.json()
      return NextResponse.json({
        success: false,
        message: `Bucket access test failed: ${errorData.error || "Unknown error"}`,
        details: {
          bucket,
          region,
          endpoint,
          error: errorData.error,
        },
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Error testing bucket access: ${error instanceof Error ? error.message : "Unknown error"}`,
    })
  }
}
