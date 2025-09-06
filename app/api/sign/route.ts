import type { NextRequest } from "next/server"
import { generatePresignedUrl } from "@/lib/s3-manual"

export async function POST(req: NextRequest) {
  try {
    const { mime, filename } = await req.json()
    if (!mime || !filename) {
      return new Response(JSON.stringify({ error: "mime and filename required" }), { status: 400 })
    }

    const bucketName = process.env.BACKBLAZE_BUCKET_NAME || "Neuraliart"
    console.log("[v0] API sign route - bucketName:", bucketName)
    console.log("[v0] API sign route - filename:", filename)
    console.log("[v0] API sign route - mime:", mime)

    const Key = `uploads/${crypto.randomUUID()}-${filename}`
    const url = await generatePresignedUrl(
      bucketName,
      Key,
      mime,
      60 * 10, // 10 minutes
    )

    return new Response(JSON.stringify({ url, key: Key }), {
      headers: { "content-type": "application/json" },
    })
  } catch (e: any) {
    console.log("[v0] Presigned URL generation error:", e.message)
    console.log("[v0] Presigned URL generation error stack:", e.stack)
    return new Response(JSON.stringify({ error: e?.message || "failed to sign" }), { status: 500 })
  }
}
