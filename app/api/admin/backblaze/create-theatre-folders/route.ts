import { NextRequest, NextResponse } from 'next/server'

const CATEGORIES = {
  Nature: ['Ocean-Surreal', 'Ocean-Underwater-Life', 'Insects', 'Beads'],
  Culture: [
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
    'India-Taj-Mahal',
  ],
  Mythic: ['Mythic-Indonesia', 'Mythic-Chile'],
  Art: [
    'Bosch-Graspher',
    'Faces',
    'Golden-Objects',
    'Shapes',
    'Children',
    'Architecture',
    'Silver-Techno',
    'Bifi-Geometry',
    'Tunnels',
    'Uncategorized',
  ],
}

export async function POST(request: NextRequest) {
  console.log('[v0] Theatre folder creation endpoint called')
  try {
    const apiKey = process.env.BACKBLAZE_API_KEY
    const applicationKey = process.env.BACKBLAZE_APPLICATION_KEY
    const bucketName = process.env.BACKBLAZE_BUCKET_NAME

    console.log('[v0] Env vars check - apiKey:', !!apiKey, 'appKey:', !!applicationKey, 'bucketName:', bucketName)

    if (!apiKey || !applicationKey || !bucketName) {
      console.log('[v0] Missing credentials')
      return NextResponse.json(
        { error: 'Backblaze credentials not configured' },
        { status: 400 }
      )
    }

    // Step 1: Authenticate with B2
    console.log('[v0] Authenticating with Backblaze for theatre folders...')
    const credentials = Buffer.from(`${apiKey}:${applicationKey}`).toString('base64')
    const authResponse = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    })

    console.log('[v0] Auth response status:', authResponse.status)
    if (!authResponse.ok) {
      const authError = await authResponse.text()
      console.log('[v0] Auth error:', authError)
      throw new Error(`Authentication failed: ${authResponse.statusText}`)
    }

    const authData = await authResponse.json()
    const { authorizationToken, apiUrl } = authData

    // Step 2: Get bucket ID
    console.log('[v0] Getting bucket ID for theatre folders...')
    const bucketsResponse = await fetch(`${apiUrl}/b2api/v2/b2_list_buckets`, {
      method: 'POST',
      headers: {
        Authorization: authorizationToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: authData.accountId,
      }),
    })

    console.log('[v0] Buckets response status:', bucketsResponse.status)
    if (!bucketsResponse.ok) {
      const bucketsError = await bucketsResponse.text()
      console.log('[v0] Buckets error:', bucketsError)
      throw new Error(`Failed to list buckets: ${bucketsResponse.statusText}`)
    }

    const bucketsData = await bucketsResponse.json()
    console.log('[v0] Found', bucketsData.buckets.length, 'buckets, looking for:', bucketName)
    const bucket = bucketsData.buckets.find((b: any) => b.bucketName === bucketName)

    if (!bucket) {
      console.log('[v0] Bucket not found. Available:', bucketsData.buckets.map((b: any) => b.bucketName))
      throw new Error(`Bucket "${bucketName}" not found`)
    }

    const bucketId = bucket.bucketId
    console.log('[v0] Bucket ID for theatre:', bucketId)

    // Step 3: Create folders by uploading marker files
    let created = 0
    let failed = 0
    const results = []

    for (const [parent, subcategories] of Object.entries(CATEGORIES)) {
      for (const subcategory of subcategories) {
        const folderPath = `THEATRE/Categories/${parent}/${subcategory}`

        try {
          // Get upload URL
          const uploadUrlResponse = await fetch(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
            method: 'POST',
            headers: {
              Authorization: authorizationToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bucketId: bucketId,
            }),
          })

          if (!uploadUrlResponse.ok) {
            throw new Error(`Failed to get upload URL: ${uploadUrlResponse.statusText}`)
          }

          const uploadInfo = await uploadUrlResponse.json()
          const uploadUrl = uploadInfo.uploadUrl
          const uploadToken = uploadInfo.authorizationToken

          // Upload marker file
          const markerFile = `${folderPath}/.folder_marker`
          const sha1 = 'da39a3ee5e6b4b0d3255bfef95601890afd80709' // SHA1 of empty string

          const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
              Authorization: uploadToken,
              'X-Bz-File-Name': markerFile,
              'Content-Type': 'text/plain',
              'X-Bz-Content-Sha1': sha1,
            },
            body: new Uint8Array(0),
          })

          if (uploadResponse.ok) {
            console.log('[v0] Created theatre folder:', folderPath)
            results.push({ path: folderPath, status: 'success' })
            created++
          } else {
            console.error('[v0] Failed to create theatre folder:', folderPath, uploadResponse.statusText)
            results.push({ path: folderPath, status: 'failed', error: uploadResponse.statusText })
            failed++
          }
        } catch (error) {
          console.error('[v0] Error creating theatre folder:', folderPath, error)
          results.push({
            path: folderPath,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          failed++
        }
      }
    }

    const summary = {
      total: Object.values(CATEGORIES).flat().length,
      created,
      failed,
      results,
    }

    console.log('[v0] Theatre folder creation summary:', summary)

    return NextResponse.json(summary)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[v0] Fatal error in theatre folder creation:', errorMsg, error)
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    )
  }
}

    // Step 1: Authenticate with B2
    console.log('[v0] Authenticating with Backblaze for theatre folders...')
    const credentials = Buffer.from(`${apiKey}:${applicationKey}`).toString('base64')
    const authResponse = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    })

    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.statusText}`)
    }

    const authData = await authResponse.json()
    const { authorizationToken, apiUrl } = authData

    // Step 2: Get bucket ID
    console.log('[v0] Getting bucket ID for theatre folders...')
    const bucketsResponse = await fetch(`${apiUrl}/b2api/v2/b2_list_buckets`, {
      method: 'POST',
      headers: {
        Authorization: authorizationToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: authData.accountId,
      }),
    })

    if (!bucketsResponse.ok) {
      throw new Error(`Failed to list buckets: ${bucketsResponse.statusText}`)
    }

    const bucketsData = await bucketsResponse.json()
    const bucket = bucketsData.buckets.find((b: any) => b.bucketName === bucketName)

    if (!bucket) {
      throw new Error(`Bucket "${bucketName}" not found`)
    }

    const bucketId = bucket.bucketId
    console.log('[v0] Bucket ID for theatre:', bucketId)

    // Step 3: Create folders by uploading marker files
    let created = 0
    let failed = 0
    const results = []

    for (const [parent, subcategories] of Object.entries(CATEGORIES)) {
      for (const subcategory of subcategories) {
        const folderPath = `THEATRE/Categories/${parent}/${subcategory}`

        try {
          // Get upload URL
          const uploadUrlResponse = await fetch(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
            method: 'POST',
            headers: {
              Authorization: authorizationToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bucketId: bucketId,
            }),
          })

          if (!uploadUrlResponse.ok) {
            throw new Error(`Failed to get upload URL: ${uploadUrlResponse.statusText}`)
          }

          const uploadInfo = await uploadUrlResponse.json()
          const uploadUrl = uploadInfo.uploadUrl
          const uploadToken = uploadInfo.authorizationToken

          // Upload marker file
          const markerFile = `${folderPath}/.folder_marker`
          const sha1 = 'da39a3ee5e6b4b0d3255bfef95601890afd80709' // SHA1 of empty string

          const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
              Authorization: uploadToken,
              'X-Bz-File-Name': markerFile,
              'Content-Type': 'text/plain',
              'X-Bz-Content-Sha1': sha1,
            },
            body: new Uint8Array(0),
          })

          if (uploadResponse.ok) {
            console.log('[v0] Created theatre folder:', folderPath)
            results.push({ path: folderPath, status: 'success' })
            created++
          } else {
            console.error('[v0] Failed to create theatre folder:', folderPath, uploadResponse.statusText)
            results.push({ path: folderPath, status: 'failed', error: uploadResponse.statusText })
            failed++
          }
        } catch (error) {
          console.error('[v0] Error creating theatre folder:', folderPath, error)
          results.push({
            path: folderPath,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          failed++
        }
      }
    }

    const summary = {
      total: Object.values(CATEGORIES).flat().length,
      created,
      failed,
      results,
    }

    console.log('[v0] Theatre folder creation summary:', summary)

    return NextResponse.json(summary)
  } catch (error) {
    console.error('[v0] Fatal error in theatre folder creation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
