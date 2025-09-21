import { type NextRequest, NextResponse } from "next/server"
import { SupabaseStorage } from "@/lib/supabase-storage"
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

      const storage = new SupabaseStorage()
      const contentType = filename.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg"

      // Upload file to Supabase
      const uploadResult = await storage.uploadFile(filename, buffer, contentType)

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Upload failed")
      }

      // Clean up chunks from memory
      chunkStore.delete(fileId)
      fileMetadata.delete(fileId)

      console.log(`[v0] File uploaded successfully to Supabase: ${uploadResult.url}`)

      return NextResponse.json({
        success: true,
        originalUrl: uploadResult.url,
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
