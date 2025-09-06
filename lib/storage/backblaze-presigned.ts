export class BackblazePresignedStorage {
  async uploadFile(file: File, filename: string): Promise<string> {
    console.log("[v0] Starting presigned URL upload for:", filename)

    // Get presigned URL from our API
    const signResponse = await fetch("/api/sign", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        mime: file.type || "application/octet-stream",
        filename: filename,
      }),
    })

    if (!signResponse.ok) {
      const error = await signResponse.json()
      throw new Error(`Failed to get presigned URL: ${error.error || "unknown"}`)
    }

    const { url, key } = await signResponse.json()
    console.log("[v0] Got presigned URL, uploading to Backblaze...")

    // Upload directly to Backblaze using presigned URL
    const uploadResponse = await fetch(url, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text().catch(() => "")
      throw new Error(`Upload failed: ${uploadResponse.status} ${errorText}`)
    }

    // Return the public URL
    const publicUrl = `https://${process.env.BACKBLAZE_BUCKET_NAME}.s3.us-east-005.backblazeb2.com/${key}`
    console.log("[v0] Upload successful, public URL:", publicUrl)

    return publicUrl
  }
}
