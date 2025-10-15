"use server"

import { WorkingBackblazeStorage } from "@/lib/backblaze-working"

interface B2File {
  fileName: string
  fileId: string
  contentLength: number
  contentType: string
  uploadTimestamp: number
  url: string
}

export async function listBackblazeImages() {
  try {
    const apiKey = process.env.BACKBLAZE_API_KEY
    const applicationKey = process.env.BACKBLAZE_APPLICATION_KEY
    const bucketName = process.env.BACKBLAZE_BUCKET_NAME

    if (!apiKey || !applicationKey || !bucketName) {
      return {
        success: false,
        error: "Backblaze credentials not configured",
        data: [],
      }
    }

    const storage = new WorkingBackblazeStorage(apiKey, applicationKey, bucketName)

    // Authenticate first
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

    // Get bucket ID
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

    // List files in bucket
    const filesResponse = await fetch(`${apiUrl}/b2api/v2/b2_list_file_names`, {
      method: "POST",
      headers: {
        Authorization: authorizationToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bucketId: bucket.bucketId,
        maxFileCount: 1000,
      }),
    })

    if (!filesResponse.ok) {
      throw new Error(`Failed to list files: ${filesResponse.statusText}`)
    }

    const filesData = await filesResponse.json()

    // Filter for image files and format response
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
      }))

    console.log(`[v0] Found ${images.length} images in Backblaze B2`)

    return {
      success: true,
      data: images,
      error: null,
    }
  } catch (error) {
    console.error("[v0] Error listing Backblaze images:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
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
