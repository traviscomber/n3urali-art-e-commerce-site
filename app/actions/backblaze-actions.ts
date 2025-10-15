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

export async function listBackblazeImages(startFileName?: string, maxCount = 100) {
  try {
    const apiKey = process.env.BACKBLAZE_API_KEY
    const applicationKey = process.env.BACKBLAZE_APPLICATION_KEY
    const bucketName = process.env.BACKBLAZE_BUCKET_NAME

    if (!apiKey || !applicationKey || !bucketName) {
      return {
        success: false,
        error: "Backblaze credentials not configured",
        data: [],
        nextFileName: null,
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

    const requestBody: any = {
      bucketId: bucket.bucketId,
      maxFileCount: maxCount,
    }

    if (startFileName) {
      requestBody.startFileName = startFileName
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

    const favoriteFileNames = new Set<string>()

    const images: B2File[] = filesData.files
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

    console.log(`[v0] Loaded ${images.length} images from Backblaze B2`)

    return {
      success: true,
      data: images,
      nextFileName: filesData.nextFileName || null,
      error: null,
    }
  } catch (error) {
    console.error("[v0] Error listing Backblaze images:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
      nextFileName: null,
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
