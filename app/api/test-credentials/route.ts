import { NextResponse } from "next/server"

export async function GET() {
  try {
    const keyId = process.env.BACKBLAZE_API_KEY
    const applicationKey = process.env.BACKBLAZE_APPLICATION_KEY
    const bucketName = process.env.BACKBLAZE_BUCKET_NAME

    return NextResponse.json({
      keyId: keyId || null,
      applicationKey: applicationKey || null,
      bucketName: bucketName || null,
      analysis: {
        keyIdFormat: keyId ? (keyId.startsWith("K005") ? "Application Key (WRONG)" : "Key ID (CORRECT)") : "Missing",
        applicationKeyFormat: applicationKey
          ? applicationKey.startsWith("K005")
            ? "Application Key (CORRECT)"
            : "Unknown format"
          : "Missing",
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to check credentials" }, { status: 500 })
  }
}
