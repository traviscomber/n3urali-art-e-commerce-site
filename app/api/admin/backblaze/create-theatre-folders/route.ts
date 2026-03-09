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
  try {
    const apiKey = process.env.BACKBLAZE_API_KEY
    const applicationKey = process.env.BACKBLAZE_APPLICATION_KEY
    const bucketName = process.env.BACKBLAZE_BUCKET_NAME

    if (!apiKey || !applicationKey || !bucketName) {
      return NextResponse.json(
        { error: 'Backblaze credentials not configured' },
        { status: 400 }
      )
    }

    // Step 1: Authenticate with B2
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
            results.push({ path: folderPath, status: 'success' })
            created++
          } else {
            results.push({ path: folderPath, status: 'failed', error: uploadResponse.statusText })
            failed++
          }
        } catch (error) {
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

    return NextResponse.json(summary)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    )
  }
}
