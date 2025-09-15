"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, X, CheckCircle, AlertCircle, Clock, Zap } from "lucide-react"
import { ImageCompressor } from "@/lib/storage/image-compression"

interface DirectUploadProps {
  onUploadComplete: (result: { url: string; key: string; fileName: string }) => void
  onUploadError: (error: string) => void
  accept?: string
  maxSize?: number // in bytes
  className?: string
}

interface UploadState {
  status: "idle" | "preparing" | "uploading" | "processing" | "success" | "error"
  progress: number
  fileName?: string
  error?: string
  url?: string
  stage?: string
  speed?: number // bytes per second
  timeRemaining?: number // seconds
  startTime?: number
}

export function DirectUpload({
  onUploadComplete,
  onUploadError,
  accept = "image/*",
  maxSize = 50 * 1024 * 1024, // 50MB default
  className = "",
}: DirectUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: 0,
  })
  const [isDragOver, setIsDragOver] = useState(false)

  const calculateSHA1 = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest("SHA-1", arrayBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  }

  const uploadFile = useCallback(
    async (file: File) => {
      const startTime = Date.now()

      try {
        console.log("[v0] Starting direct upload for:", file.name, "size:", file.size)

        setUploadState({
          status: "preparing",
          progress: 0,
          fileName: file.name,
          stage: "Preparing upload...",
          startTime,
        })

        let fileToUpload = file
        let compressionInfo = ""

        // Check if file needs compression (images over 2MB)
        if (file.type.startsWith("image/") && file.size > 2 * 1024 * 1024) {
          console.log("[v0] File is large, compressing...")
          setUploadState((prev) => ({
            ...prev,
            progress: 2,
            stage: "Compressing image...",
          }))

          try {
            const compressed = await ImageCompressor.compressImage(file, {
              maxWidth: 2048,
              maxHeight: 2048,
              quality: 0.85,
              format: file.type.includes("png") ? "png" : "jpeg",
            })

            fileToUpload = compressed.file
            const compressionRatio = (((file.size - compressed.compressedSize) / file.size) * 100).toFixed(1)
            compressionInfo = ` (compressed ${compressionRatio}% from ${formatBytes(file.size)})`

            console.log("[v0] Image compressed:", {
              original: file.size,
              compressed: compressed.compressedSize,
              ratio: compressionRatio + "%",
            })
          } catch (compressionError) {
            console.warn("[v0] Image compression failed, uploading original:", compressionError)
            // Continue with original file if compression fails
          }
        }

        // Step 1: Get presigned URL from our API
        console.log("[v0] Getting presigned URL...")
        setUploadState((prev) => ({
          ...prev,
          progress: 5,
          stage: "Getting upload URL...",
        }))

        const presignedResponse = await fetch("/api/backblaze/presigned-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: file.name, // Keep original filename
            contentType: fileToUpload.type || "application/octet-stream",
          }),
        })

        if (!presignedResponse.ok) {
          const errorData = await presignedResponse.json()
          throw new Error(errorData.error || "Failed to get upload URL")
        }

        const { uploadUrl, key, fileName } = await presignedResponse.json()
        console.log("[v0] Got presigned URL, key:", key)

        setUploadState((prev) => ({
          ...prev,
          progress: 10,
          stage: "Calculating file hash...",
        }))

        // Step 2: Calculate SHA1 hash of the file to upload
        console.log("[v0] Calculating SHA1 hash...")
        const sha1Hash = await calculateSHA1(fileToUpload)
        console.log("[v0] SHA1 calculated:", sha1Hash)

        setUploadState((prev) => ({
          ...prev,
          progress: 15,
          stage: `Starting upload${compressionInfo}...`,
          status: "uploading",
        }))

        // Step 3: Upload directly to Backblaze with progress tracking
        console.log("[v0] Uploading directly to Backblaze...")

        // Create a custom XMLHttpRequest for progress tracking
        const uploadPromise = new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100
              const uploadProgress = 15 + percentComplete * 0.7 // 15% to 85%

              // Calculate upload speed and time remaining
              const currentTime = Date.now()
              const elapsedTime = (currentTime - startTime) / 1000 // seconds
              const speed = event.loaded / elapsedTime // bytes per second
              const remainingBytes = event.total - event.loaded
              const timeRemaining = remainingBytes / speed // seconds

              setUploadState((prev) => ({
                ...prev,
                progress: Math.round(uploadProgress),
                stage: `Uploading... ${formatBytes(event.loaded)} / ${formatBytes(event.total)}${compressionInfo}`,
                speed,
                timeRemaining: timeRemaining > 0 ? timeRemaining : undefined,
              }))
            }
          })

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve()
            } else {
              reject(new Error(`Upload failed: ${xhr.status} - ${xhr.statusText}`))
            }
          })

          xhr.addEventListener("error", () => {
            reject(new Error("Network error during upload"))
          })

          xhr.addEventListener("abort", () => {
            reject(new Error("Upload was aborted"))
          })

          xhr.open("POST", uploadUrl)
          xhr.setRequestHeader("X-Bz-File-Name", encodeURIComponent(key))
          xhr.setRequestHeader("Content-Type", fileToUpload.type || "application/octet-stream")
          xhr.setRequestHeader("X-Bz-Content-Sha1", sha1Hash)
          xhr.send(fileToUpload) // Send compressed file instead of original
        })

        await uploadPromise

        setUploadState((prev) => ({
          ...prev,
          progress: 90,
          stage: "Finalizing upload...",
          status: "processing",
        }))

        // Construct public URL
        const publicUrl = `https://f005.backblazeb2.com/file/${process.env.NEXT_PUBLIC_BACKBLAZE_BUCKET_NAME || "n3urali-art"}/${key}`

        console.log("[v0] Direct upload successful:", publicUrl)

        const totalTime = (Date.now() - startTime) / 1000
        const avgSpeed = fileToUpload.size / totalTime

        setUploadState({
          status: "success",
          progress: 100,
          fileName: file.name,
          url: publicUrl,
          stage: `Upload completed in ${formatTime(totalTime)}${compressionInfo}`,
          speed: avgSpeed,
        })

        // Call success callback
        onUploadComplete({
          url: publicUrl,
          key,
          fileName: file.name,
        })
      } catch (error) {
        console.error("[v0] Direct upload error:", error)
        const errorMessage = error instanceof Error ? error.message : "Upload failed"

        setUploadState({
          status: "error",
          progress: 0,
          fileName: file.name,
          error: errorMessage,
          stage: "Upload failed",
        })

        onUploadError(errorMessage)
      }
    },
    [onUploadComplete, onUploadError],
  )

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return

      const file = files[0]

      // Validate file size
      if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024)
        const errorMessage = `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size (${maxSizeMB}MB)`
        setUploadState({
          status: "error",
          progress: 0,
          fileName: file.name,
          error: errorMessage,
          stage: "File too large",
        })
        onUploadError(errorMessage)
        return
      }

      uploadFile(file)
    },
    [uploadFile, maxSize, onUploadError],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files)
    },
    [handleFileSelect],
  )

  const resetUpload = useCallback(() => {
    setUploadState({
      status: "idle",
      progress: 0,
    })
  }, [])

  const getStatusIcon = () => {
    switch (uploadState.status) {
      case "preparing":
        return <Clock className="h-8 w-8 animate-pulse text-blue-500" />
      case "uploading":
        return <Upload className="h-8 w-8 animate-pulse text-blue-500" />
      case "processing":
        return <Zap className="h-8 w-8 animate-pulse text-yellow-500" />
      case "success":
        return <CheckCircle className="h-8 w-8 text-green-500" />
      case "error":
        return <AlertCircle className="h-8 w-8 text-red-500" />
      default:
        return <Upload className="h-8 w-8 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (uploadState.status) {
      case "preparing":
        return uploadState.stage || "Preparing upload..."
      case "uploading":
        return uploadState.stage || `Uploading ${uploadState.fileName}...`
      case "processing":
        return uploadState.stage || "Processing upload..."
      case "success":
        return `Successfully uploaded ${uploadState.fileName}`
      case "error":
        return uploadState.error || "Upload failed"
      default:
        return "Click to select file or drag and drop"
    }
  }

  const getProgressColor = () => {
    switch (uploadState.status) {
      case "success":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      case "uploading":
        return "bg-blue-500"
      case "processing":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"}
          ${uploadState.status === "success" ? "border-green-500 bg-green-50" : ""}
          ${uploadState.status === "error" ? "border-red-500 bg-red-50" : ""}
          ${uploadState.status === "idle" ? "hover:border-gray-400 hover:bg-gray-50 cursor-pointer" : ""}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (uploadState.status === "idle") {
            document.getElementById("file-input")?.click()
          }
        }}
      >
        <input
          id="file-input"
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={
            uploadState.status === "uploading" ||
            uploadState.status === "preparing" ||
            uploadState.status === "processing"
          }
        />

        <div className="flex flex-col items-center space-y-4">
          {getStatusIcon()}

          <div className="space-y-2 w-full max-w-md">
            <p className="text-sm font-medium text-gray-900">{getStatusText()}</p>

            {uploadState.status === "idle" && (
              <p className="text-xs text-gray-500">Maximum file size: {(maxSize / 1024 / 1024).toFixed(0)}MB</p>
            )}

            {/* Enhanced progress tracking */}
            {(uploadState.status === "preparing" ||
              uploadState.status === "uploading" ||
              uploadState.status === "processing") && (
              <div className="w-full space-y-2">
                <div className="relative">
                  <Progress value={uploadState.progress} className="h-3" />
                  <div
                    className={`absolute inset-0 h-3 rounded-full ${getProgressColor()} transition-all duration-300`}
                    style={{ width: `${uploadState.progress}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-600">
                  <span>{uploadState.progress}% complete</span>
                  {uploadState.speed && <span>{formatBytes(uploadState.speed)}/s</span>}
                </div>

                {uploadState.timeRemaining && uploadState.timeRemaining > 1 && (
                  <p className="text-xs text-gray-500">
                    Estimated time remaining: {formatTime(uploadState.timeRemaining)}
                  </p>
                )}
              </div>
            )}

            {/* Success details */}
            {uploadState.status === "success" && uploadState.speed && (
              <div className="text-xs text-green-600 space-y-1">
                <p>Average speed: {formatBytes(uploadState.speed)}/s</p>
                {uploadState.stage && <p>{uploadState.stage}</p>}
              </div>
            )}

            {/* Error details */}
            {uploadState.status === "error" && uploadState.error && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                <p className="font-medium">Error Details:</p>
                <p>{uploadState.error}</p>
              </div>
            )}
          </div>

          {(uploadState.status === "success" || uploadState.status === "error") && (
            <Button
              onClick={(e) => {
                e.stopPropagation()
                resetUpload()
              }}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
