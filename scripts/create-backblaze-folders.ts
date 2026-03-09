#!/usr/bin/env node

/**
 * Script to create 32 video category folders in Backblaze B2
 * Usage: npx ts-node scripts/create-backblaze-folders.ts
 * 
 * Requires environment variables:
 * - B2_APPLICATION_KEY_ID
 * - B2_APPLICATION_KEY
 * - B2_BUCKET_NAME (e.g., "Neuraliart")
 */

import axios from 'axios'

const B2_API_URL = 'https://api.backblazeb2.com'
const APPLICATION_KEY_ID = process.env.B2_APPLICATION_KEY_ID
const APPLICATION_KEY = process.env.B2_APPLICATION_KEY
const BUCKET_NAME = process.env.B2_BUCKET_NAME || 'Neuraliart'

// 32 Video categories organized into 4 parent groups
const VIDEO_CATEGORIES = {
  'Nature': [
    'Ocean-Surreal',
    'Ocean-Underwater-Life',
    'Insects',
    'Beads'
  ],
  'Culture': [
    'Turkey',
    'Japan',
    'Halloween',
    'Indonesia-Tribes',
    'Thailand',
    'Australia',
    'Indonesian-Temples',
    'Africa',
    'Chile-Tribes',
    'Argentina-Rio',
    'Korea',
    'Galleries',
    'Vietnam-Theatre',
    'India-Taj-Mahal'
  ],
  'Mythic': [
    'Mythic-Indonesia',
    'Mythic-Chile'
  ],
  'Art': [
    'Bosch-Graspher',
    'Faces',
    'Golden-Objects',
    'Shapes',
    'Children',
    'Architecture',
    'Silver-Techno',
    'Bifi-Geometry',
    'Tunnels',
    'Uncategorized'
  ]
}

interface B2AuthResponse {
  authorizationToken: string
  apiUrl: string
  downloadUrl: string
  minimumPartSize: number
}

interface B2ListBucketsResponse {
  buckets: Array<{
    accountId: string
    bucketId: string
    bucketName: string
    bucketType: string
    corsRules: any[]
    lifecycleRules: any[]
    revision: number
  }>
}

async function authenticateWithB2(): Promise<B2AuthResponse> {
  console.log('[v0] Authenticating with Backblaze B2...')
  
  if (!APPLICATION_KEY_ID || !APPLICATION_KEY) {
    throw new Error('Missing B2_APPLICATION_KEY_ID or B2_APPLICATION_KEY environment variables')
  }

  try {
    const response = await axios.post<B2AuthResponse>(
      `${B2_API_URL}/b2api/v2/b2_authorize_account`,
      {},
      {
        auth: {
          username: APPLICATION_KEY_ID,
          password: APPLICATION_KEY
        }
      }
    )
    
    console.log('[v0] Authentication successful')
    return response.data
  } catch (error) {
    console.error('[v0] Authentication failed:', error)
    throw error
  }
}

async function getBucketId(
  auth: B2AuthResponse,
  bucketName: string
): Promise<string> {
  console.log('[v0] Getting bucket ID for:', bucketName)
  
  try {
    const response = await axios.get<B2ListBucketsResponse>(
      `${auth.apiUrl}/b2api/v2/b2_list_buckets`,
      {
        headers: {
          'Authorization': auth.authorizationToken
        },
        data: {
          accountId: auth.authorizationToken.split('_')[0]
        }
      }
    )
    
    const bucket = response.data.buckets.find(b => b.bucketName === bucketName)
    if (!bucket) {
      throw new Error(`Bucket "${bucketName}" not found`)
    }
    
    console.log('[v0] Found bucket ID:', bucket.bucketId)
    return bucket.bucketId
  } catch (error) {
    console.error('[v0] Failed to get bucket ID:', error)
    throw error
  }
}

async function createFolderPlaceholder(
  auth: B2AuthResponse,
  bucketId: string,
  folderPath: string
): Promise<void> {
  console.log('[v0] Creating folder placeholder:', folderPath)
  
  try {
    // In B2, we create a folder placeholder by uploading an empty ".folder" marker file
    const placeholderPath = `${folderPath}/.folder`
    
    // Get upload URL
    const uploadUrlResponse = await axios.post(
      `${auth.apiUrl}/b2api/v2/b2_get_upload_url`,
      {
        bucketId: bucketId
      },
      {
        headers: {
          'Authorization': auth.authorizationToken
        }
      }
    )
    
    const uploadUrl = uploadUrlResponse.data.uploadUrl
    const uploadAuthToken = uploadUrlResponse.data.authorizationToken
    
    // Upload empty file to create folder
    await axios.post(
      uploadUrl,
      Buffer.alloc(0),
      {
        headers: {
          'Authorization': uploadAuthToken,
          'X-Bz-File-Name': placeholderPath,
          'Content-Type': 'application/octet-stream',
          'X-Bz-Content-Sha1': 'da39a3ee5e6b4b0d3255bfef95601890afd80709' // SHA1 of empty string
        }
      }
    )
    
    console.log('[v0] ✓ Created folder:', folderPath)
  } catch (error) {
    console.error('[v0] Failed to create folder:', folderPath, error)
    throw error
  }
}

async function createAllFolders(): Promise<void> {
  try {
    // Authenticate
    const auth = await authenticateWithB2()
    
    // Get bucket ID
    const bucketId = await getBucketId(auth, BUCKET_NAME)
    
    console.log('[v0] \nCreating 32 video category folders...\n')
    
    let folderCount = 0
    
    // Create folders for each parent category and subcategory
    for (const [parentCategory, subcategories] of Object.entries(VIDEO_CATEGORIES)) {
      for (const subcategory of subcategories) {
        const folderPath = `VIDS/Categories/${parentCategory}/${subcategory}`
        await createFolderPlaceholder(auth, bucketId, folderPath)
        folderCount++
      }
    }
    
    console.log(`\n[v0] ✓ Successfully created ${folderCount} folders in Backblaze B2`)
    console.log('[v0] Folder structure:')
    console.log('[v0] VIDS/Categories/')
    
    for (const [parentCategory, subcategories] of Object.entries(VIDEO_CATEGORIES)) {
      console.log(`[v0]   ${parentCategory}/ (${subcategories.length} subcategories)`)
    }
    
  } catch (error) {
    console.error('[v0] Failed to create folders:', error)
    process.exit(1)
  }
}

// Run the script
createAllFolders()
