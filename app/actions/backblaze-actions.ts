"use server"

import { WorkingBackblazeStorage } from "@/lib/backblaze-working"

interface B2File {
  fileName: string
  fileId: string
  contentLength: number
  contentType: string
  uploadTimestamp: number
  url: string
  isFavorite?: boolean
}

export async function listBackblazeImages(offset = 0, maxCount = 100) {
  try {
    const apiKey = process.env.BACKBLAZE_API_KEY
    const applicationKey = process.env.BACKBLAZE_APPLICATION_KEY
    const bucketName = process.env.BACKBLAZE_BUCKET_NAME

    if (!apiKey || !applicationKey || !bucketName) {
      return {
        success: false,
        error: "Backblaze credentials not configured",
        data: [],
        hasMore: false,
        totalCount: 0,
      }
    }

    const storage = new WorkingBackblazeStorage(apiKey, applicationKey, bucketName)

    const credentials = Buffer.from(`${apiKey}:${applicationKey}`).toString("base64")
    const authResponse = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    })

    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.statusText}`)
    }

    const authData = await authResponse.json()
    const { authorizationToken, apiUrl, downloadUrl } = authData

    const bucketsResponse = await fetch(`${apiUrl}/b2api/v2/b2_list_buckets`, {
      method: "POST",
      headers: {
        Authorization: authorizationToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountId: authData.accountId,
        bucketName: bucketName,
      }),
    })

    if (!bucketsResponse.ok) {
      throw new Error(`Failed to list buckets: ${bucketsResponse.statusText}`)
    }

    const bucketsData = await bucketsResponse.json()
    const bucket = bucketsData.buckets[0]

    if (!bucket) {
      throw new Error("Bucket not found")
    }

    let allFiles: any[] = []
    let nextFileName: string | null = null
    let hasMore = true

    // Fetch all files with pagination
    while (hasMore) {
      const requestBody: any = {
        bucketId: bucket.bucketId,
        maxFileCount: 10000, // Max allowed by B2 API
      }

      if (nextFileName) {
        requestBody.startFileName = nextFileName
      }

      const filesResponse = await fetch(`${apiUrl}/b2api/v2/b2_list_file_names`, {
        method: "POST",
        headers: {
          Authorization: authorizationToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!filesResponse.ok) {
        throw new Error(`Failed to list files: ${filesResponse.statusText}`)
      }

      const filesData = await filesResponse.json()
      allFiles = allFiles.concat(filesData.files)
      nextFileName = filesData.nextFileName
      hasMore = !!nextFileName
    }

    const favoriteFileNames = new Set<string>()

    // Filter for images only
    const allImages: B2File[] = allFiles
      .filter((file: any) => {
        const ext = file.fileName.toLowerCase()
        return ext.endsWith(".jpg") || ext.endsWith(".jpeg") || ext.endsWith(".png") || ext.endsWith(".webp")
      })
      .map((file: any) => ({
        fileName: file.fileName,
        fileId: file.fileId,
        contentLength: file.contentLength,
        contentType: file.contentType,
        uploadTimestamp: file.uploadTimestamp,
        url: `${downloadUrl}/file/${bucketName}/${file.fileName}`,
        isFavorite: favoriteFileNames.has(file.fileName),
      }))

    allImages.sort((a, b) => b.uploadTimestamp - a.uploadTimestamp)

    const totalCount = allImages.length
    console.log(`[v0] Loaded ${totalCount} total images from Backblaze B2, sorted by newest first`)

    const images = allImages.slice(offset, offset + maxCount)
    const hasMoreImages = offset + maxCount < totalCount

    return {
      success: true,
      data: images,
      hasMore: hasMoreImages,
      totalCount: totalCount,
      error: null,
    }
  } catch (error) {
    console.error("[v0] Error listing Backblaze images:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
      hasMore: false,
      totalCount: 0,
    }
  }
}

export async function getBackblazeImageUrl(fileName: string) {
  try {
    const apiKey = process.env.BACKBLAZE_API_KEY
    const applicationKey = process.env.BACKBLAZE_APPLICATION_KEY
    const bucketName = process.env.BACKBLAZE_BUCKET_NAME

    if (!apiKey || !applicationKey || !bucketName) {
      return {
        success: false,
        error: "Backblaze credentials not configured",
        data: null,
      }
    }

    const storage = new WorkingBackblazeStorage(apiKey, applicationKey, bucketName)
    const url = await storage.getAuthenticatedDownloadUrl(fileName)

    return {
      success: true,
      data: url,
      error: null,
    }
  } catch (error) {
    console.error("[v0] Error getting Backblaze image URL:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null,
    }
  }
}

export async function deleteBackblazeImage(fileId: string, fileName: string) {
  try {
    console.log(`[v0] Attempting to delete file: ${fileName} (ID: ${fileId})`)

    const apiKey = process.env.BACKBLAZE_API_KEY
    const applicationKey = process.env.BACKBLAZE_APPLICATION_KEY
    const bucketName = process.env.BACKBLAZE_BUCKET_NAME

    if (!apiKey || !applicationKey || !bucketName) {
      console.error("[v0] Missing Backblaze credentials")
      return {
        success: false,
        error: "Backblaze credentials not configured",
      }
    }

    if (!fileId || !fileName) {
      console.error("[v0] Missing fileId or fileName")
      return {
        success: false,
        error: "File ID and name are required",
      }
    }

    const credentials = Buffer.from(`${apiKey}:${applicationKey}`).toString("base64")

    console.log("[v0] Authenticating with Backblaze...")
    const authResponse = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    })

    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      console.error("[v0] Authentication failed:", errorText)
      throw new Error(`Authentication failed: ${authResponse.statusText}`)
    }

    const authData = await authResponse.json()
    const { authorizationToken, apiUrl } = authData

    console.log("[v0] Authentication successful, deleting file...")

    const deleteResponse = await fetch(`${apiUrl}/b2api/v2/b2_delete_file_version`, {
      method: "POST",
      headers: {
        Authorization: authorizationToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileId: fileId,
        fileName: fileName,
      }),
    })

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json()
      console.error("[v0] Delete failed:", errorData)
      throw new Error(`Failed to delete file: ${errorData.message || deleteResponse.statusText}`)
    }

    const deleteData = await deleteResponse.json()
    console.log(`[v0] Successfully deleted file: ${fileName}`, deleteData)

    return {
      success: true,
      error: null,
    }
  } catch (error) {
    console.error("[v0] Error deleting Backblaze image:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Removed toggleB2Favorite function to avoid errors when table doesn't exist

export async function uploadToBackblaze(
  buffer: Buffer,
  filePath: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    console.log("[v0] uploadToBackblaze called with path:", filePath)

    const apiKey = process.env.BACKBLAZE_API_KEY
    const applicationKey = process.env.BACKBLAZE_APPLICATION_KEY
    const bucketName = process.env.BACKBLAZE_BUCKET_NAME
    const bucketId = process.env.BACKBLAZE_BUCKET_ID

    console.log("[v0] bucketName from env:", bucketName, "bucketId:", bucketId)

    if (!apiKey || !applicationKey || !bucketName || !bucketId) {
      console.error("[v0] Missing Backblaze credentials - bucketName:", bucketName)
      return {
        success: false,
        error: "Backblaze credentials not configured",
      }
    }

    console.log("[v0] Credentials present, authenticating with B2...")

    // Get authorization
    const credentials = Buffer.from(`${apiKey}:${applicationKey}`).toString("base64")
    const authResponse = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    })

    console.log("[v0] Auth response status:", authResponse.status)

    if (!authResponse.ok) {
      const authError = await authResponse.text()
      console.error("[v0] Auth failed:", authError)
      throw new Error(`B2 authentication failed: ${authResponse.status}`)
    }

    const authData = await authResponse.json()
    const { authorizationToken, apiUrl, downloadUrl } = authData

    console.log("[v0] Authentication successful, getting upload URL...")

    // Get upload URL
    const uploadUrlResponse = await fetch(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
      method: "POST",
      headers: {
        Authorization: authorizationToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bucketId: bucketId,
      }),
    })

    console.log("[v0] Upload URL response status:", uploadUrlResponse.status)

    if (!uploadUrlResponse.ok) {
      const urlError = await uploadUrlResponse.text()
      console.error("[v0] Get upload URL failed:", urlError)
      throw new Error(`Failed to get upload URL: ${uploadUrlResponse.status}`)
    }

    const uploadUrlData = await uploadUrlResponse.json()

    console.log("[v0] Got upload URL, uploading file with name:", filePath, "buffer size:", buffer.length)

    // Upload file
    const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
      method: "POST",
      headers: {
        Authorization: uploadUrlData.authorizationToken,
        "X-Bz-File-Name": encodeURIComponent(filePath),
        "Content-Type": "application/octet-stream",
        "X-Bz-Content-Sha1": "do_not_verify",
      },
      body: new Uint8Array(buffer),
    })

    console.log("[v0] File upload response status:", uploadResponse.status)

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error("[v0] File upload failed:", uploadResponse.status, errorText)
      throw new Error(`File upload failed: ${uploadResponse.status} - ${errorText}`)
    }

    const uploadedFile = await uploadResponse.json()

    console.log("[v0] uploadedFile response:", uploadedFile)
    console.log("[v0] uploadedFile.fileName:", uploadedFile.fileName)
    console.log("[v0] filePath sent to B2:", filePath)
    console.log("[v0] bucketName:", bucketName)

    // B2 returns just the filename, but we sent the full path (PICS/Theatre/...)
    // So uploadedFile.fileName should already include the path from the X-Bz-File-Name header
    // But if it doesn't, we construct it
    const fullFileName = uploadedFile.fileName.includes('/') ? uploadedFile.fileName : filePath

    // Use the standard B2 public URL format that matches your other images
    // Format: https://f005.backblazeb2.com/file/Neuraliart/PICS/Theatre/[filename]
    const fileUrl = `https://f005.backblazeb2.com/file/${bucketName}/${fullFileName}`

    console.log("[v0] Constructed URL:", fileUrl)
    console.log("[v0] File uploaded successfully to:", fileUrl)

    return {
      success: true,
      url: fileUrl,
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[v0] Error uploading to Backblaze:", errorMsg)
    return {
      success: false,
      error: errorMsg,
    }
  }
}
