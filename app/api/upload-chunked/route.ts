import { type NextRequest, NextResponse } from "next/server"
import { BackblazeAuth } from "@/lib/backblaze-auth"
import { Buffer } from "buffer"

interface ChunkUploadRequest {
  chunkIndex: number
  totalChunks: number
  filename: string
  fileId: string
  chunk: string // base64 encoded chunk
  fileSize: number
  isLastChunk: boolean
}

// Store chunks in memory (in production, use Redis or database)
const chunkStore = new Map<string, Map<number, string>>()
const fileMetadata = new Map<string, { filename: string; totalChunks: number; fileSize: number }>()

export async function POST(request: NextRequest) {
  try {
    const data: ChunkUploadRequest = await request.json()
    const { chunkIndex, totalChunks, filename, fileId, chunk, fileSize, isLastChunk } = data

    console.log(`[v0] Receiving chunk ${chunkIndex + 1}/${totalChunks} for file ${filename}`)

    // Initialize chunk storage for this file
    if (!chunkStore.has(fileId)) {
      chunkStore.set(fileId, new Map())
      fileMetadata.set(fileId, { filename, totalChunks, fileSize })
    }

    // Store the chunk
    const chunks = chunkStore.get(fileId)!
    chunks.set(chunkIndex, chunk)

    // Check if all chunks are received
    if (chunks.size === totalChunks || isLastChunk) {
      console.log(`[v0] All chunks received for ${filename}, assembling file...`)

      // Assemble chunks in order
      const assembledChunks: string[] = []
      for (let i = 0; i < totalChunks; i++) {
        const chunkData = chunks.get(i)
        if (!chunkData) {
          throw new Error(`Missing chunk ${i} for file ${filename}`)
        }
        assembledChunks.push(chunkData)
      }

      // Combine all chunks
      const fullBase64 = assembledChunks.join("")

      const buffer = Buffer.from(fullBase64, "base64")

      console.log(`[v0] Assembled file size: ${(buffer.length / (1024 * 1024)).toFixed(2)}MB`)

      const backblaze = new BackblazeAuth()
      const key = `uploads/${crypto.randomUUID()}-${filename}`
      const contentType = filename.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg"

      // Get presigned URL for upload
      const presignedUrl = await backblaze.generatePresignedUrl(key, contentType)

      // Upload file to Backblaze using presigned URL
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: buffer,
        headers: {
          "Content-Type": contentType,
          "Content-Length": buffer.length.toString(),
        },
      })

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload to Backblaze: ${uploadResponse.statusText}`)
      }

      const config = backblaze.getConfig()
      console.log(`[v0] Backblaze config - endpoint: ${config.endpoint}, bucket: ${config.bucket}`)

      // Construct the public URL safely
      const publicUrl = `https://f000.backblazeb2.com/file/${config.bucket}/${key}`
      console.log(`[v0] Constructed Backblaze public URL: ${publicUrl}`)

      // Clean up chunks from memory
      chunkStore.delete(fileId)
      fileMetadata.delete(fileId)

      console.log(`[v0] File uploaded successfully to Backblaze: ${publicUrl}`)

      return NextResponse.json({
        success: true,
        originalUrl: publicUrl,
        filename: filename,
        size: buffer.length,
        type: contentType,
      })
    }

    // Return progress for partial uploads
    return NextResponse.json({
      success: true,
      progress: (chunks.size / totalChunks) * 100,
      chunksReceived: chunks.size,
      totalChunks: totalChunks,
    })
  } catch (error) {
    console.error("[v0] Chunked upload error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 },
    )
  }
}
