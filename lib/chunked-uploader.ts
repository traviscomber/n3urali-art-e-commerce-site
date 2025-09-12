export interface ChunkedUploadOptions {
  chunkSize?: number // Size in bytes, default 5MB
  maxFileSize?: number // Maximum file size in bytes, default 150MB
  onProgress?: (progress: number) => void
  onChunkComplete?: (chunkIndex: number, totalChunks: number) => void
}

export class ChunkedUploader {
  private static readonly DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024 // 5MB
  private static readonly MAX_FILE_SIZE = 150 * 1024 * 1024 // 150MB

  static async uploadFile(
    file: File,
    options: ChunkedUploadOptions = {},
  ): Promise<{ success: boolean; originalUrl?: string; error?: string }> {
    const {
      chunkSize = this.DEFAULT_CHUNK_SIZE,
      maxFileSize = this.MAX_FILE_SIZE,
      onProgress,
      onChunkComplete,
    } = options

    // Validate file size
    if (file.size > maxFileSize) {
      return {
        success: false,
        error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum allowed size (${(maxFileSize / (1024 * 1024)).toFixed(0)}MB)`,
      }
    }

    console.log(`[v0] Starting chunked upload for ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`)

    const fileId = crypto.randomUUID()
    const totalChunks = Math.ceil(file.size / chunkSize)

    try {
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * chunkSize
        const end = Math.min(start + chunkSize, file.size)

        // Get binary chunk from file
        const chunkBlob = file.slice(start, end)

        // Convert chunk to base64
        const chunkBase64 = await this.blobToBase64(chunkBlob)
        const chunk = chunkBase64.split(",")[1] // Remove data URL prefix

        console.log(`[v0] Uploading chunk ${chunkIndex + 1}/${totalChunks} (${(chunkBlob.size / 1024).toFixed(1)}KB)`)

        const response = await fetch("/api/upload-chunked", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chunkIndex,
            totalChunks,
            filename: file.name,
            fileId,
            chunk,
            fileSize: file.size,
            isLastChunk: chunkIndex === totalChunks - 1,
          }),
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || `Failed to upload chunk ${chunkIndex + 1}`)
        }

        // Update progress
        const progress = ((chunkIndex + 1) / totalChunks) * 100
        onProgress?.(progress)
        onChunkComplete?.(chunkIndex, totalChunks)

        console.log(`[v0] Chunk ${chunkIndex + 1}/${totalChunks} completed`)

        // If this was the last chunk and we got a URL back, we're done
        if (result.originalUrl) {
          console.log(`[v0] Chunked upload completed successfully`)
          return {
            success: true,
            originalUrl: result.originalUrl,
          }
        }
      }

      throw new Error("Upload completed but no URL received")
    } catch (error) {
      console.error("[v0] Chunked upload failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      }
    }
  }

  private static blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  static shouldUseChunkedUpload(file: File): boolean {
    // Use chunked upload for files larger than 10MB
    return file.size > 10 * 1024 * 1024
  }
}
