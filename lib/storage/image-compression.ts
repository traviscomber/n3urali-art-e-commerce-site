export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: "jpeg" | "webp" | "png"
}

export class ImageCompressor {
  static async compressImage(
    file: File,
    options: CompressionOptions = {},
  ): Promise<{ file: File; originalSize: number; compressedSize: number }> {
    const { maxWidth = 2048, maxHeight = 2048, quality = 0.8, format = "jpeg" } = options

    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"))
              return
            }

            const compressedFile = new File([blob], file.name, {
              type: `image/${format}`,
              lastModified: Date.now(),
            })

            resolve({
              file: compressedFile,
              originalSize: file.size,
              compressedSize: blob.size,
            })
          },
          `image/${format}`,
          quality,
        )
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = URL.createObjectURL(file)
    })
  }

  static async shouldCompress(file: File, maxSizeMB = 10): Promise<boolean> {
    const fileSizeMB = file.size / (1024 * 1024)
    return fileSizeMB > maxSizeMB && file.type.startsWith("image/")
  }
}
