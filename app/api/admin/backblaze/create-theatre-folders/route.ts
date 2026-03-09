import { NextResponse } from 'next/server'

const B2_API_URL = 'https://api.backblazeb2.com/b2api/v2'

const THEATRE_CATEGORIES = {
  'Nature': ['Ocean-Surreal', 'Ocean-Underwater-Life', 'Insects', 'Beads'],
  'Culture': ['Turkey', 'Japan', 'Halloween', 'Indonesia-Tribes', 'Thailand', 'Australia',
              'Indonesian-Temples', 'Africa', 'Chile-Tribes', 'Argentina-Rio', 'Korea',
              'Galleries', 'Vietnam-Theatre', 'India-Taj-Mahal'],
  'Mythic': ['Mythic-Indonesia', 'Mythic-Chile'],
  'Art': ['Bosch-Graspher', 'Faces', 'Golden-Objects', 'Shapes', 'Children', 'Architecture',
          'Silver-Techno', 'Bifi-Geometry', 'Tunnels', 'Uncategorized']
}

async function makeB2Request(url: string, method: string, headers: Record<string, string>, body?: any) {
  try {
    const options: RequestInit = {
      method,
      headers
    }
    
    if (body) {
      headers['Content-Type'] = 'application/json'
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)
    
    if (!response.ok) {
      const error = await response.text()
      console.error(`[v0] B2 request failed: ${response.status} - ${error}`)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('[v0] B2 request error:', error)
    return null
  }
}

export async function POST() {
  try {
    const b2ApiKey = process.env.BACKBLAZE_API_KEY
    const b2AppKey = process.env.BACKBLAZE_APPLICATION_KEY
    const bucketName = process.env.BACKBLAZE_BUCKET_NAME || 'Neuraliart'

    if (!b2ApiKey || !b2AppKey) {
      return NextResponse.json(
        { error: 'Backblaze credentials not configured' },
        { status: 500 }
      )
    }

    // Authenticate with B2
    const credentials = Buffer.from(`${b2ApiKey}:${b2AppKey}`).toString('base64')
    const authData = await makeB2Request(
      `${B2_API_URL}/b2_authorize_account`,
      'GET',
      { 'Authorization': `Basic ${credentials}` }
    )

    if (!authData) {
      return NextResponse.json({ error: 'B2 authentication failed' }, { status: 500 })
    }

    const apiUrl = authData.apiUrl
    const authToken = authData.authorizationToken
    const accountId = authData.accountId

    console.log('[v0] B2 authenticated for theatre folder creation')

    // Get bucket ID
    const bucketsData = await makeB2Request(
      `${apiUrl}/b2api/v2/b2_list_buckets`,
      'POST',
      { 'Authorization': authToken },
      { accountId }
    )

    if (!bucketsData || !bucketsData.buckets) {
      return NextResponse.json({ error: 'Failed to list buckets' }, { status: 500 })
    }

    const bucket = bucketsData.buckets.find((b: any) => b.bucketName === bucketName)
    if (!bucket) {
      return NextResponse.json({ error: `Bucket ${bucketName} not found` }, { status: 500 })
    }

    const bucketId = bucket.bucketId
    console.log('[v0] Found bucket:', bucketId)

    // Create all theatre folders
    const results: any = {
      success: [],
      failed: []
    }

    for (const [parent, subcategories] of Object.entries(THEATRE_CATEGORIES)) {
      for (const subcategory of subcategories) {
        const folderPath = `VIDS/Categories/Theatre/${parent}/${subcategory}`

        // Get upload URL
        const uploadUrlData = await makeB2Request(
          `${apiUrl}/b2api/v2/b2_get_upload_url`,
          'POST',
          { 'Authorization': authToken },
          { bucketId }
        )

        if (!uploadUrlData) {
          results.failed.push({ folder: folderPath, reason: 'Failed to get upload URL' })
          continue
        }

        // Create .folder_marker to represent the folder
        const markerFile = `${folderPath}/.folder_marker`
        const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': uploadUrlData.authorizationToken,
            'X-Bz-File-Name': markerFile,
            'Content-Type': 'text/plain',
            'X-Bz-Content-Sha1': 'da39a3ee5e6b4b0d3255bfef95601890afd80709'
          },
          body: ''
        })

        if (uploadResponse.ok) {
          results.success.push({ folder: folderPath, status: 'created' })
          console.log('[v0] Created theatre folder:', folderPath)
        } else {
          results.failed.push({ folder: folderPath, reason: await uploadResponse.text() })
          console.error('[v0] Failed to create theatre folder:', folderPath)
        }
      }
    }

    const totalFolders = Object.values(THEATRE_CATEGORIES).reduce((sum: number, cats: any) => sum + cats.length, 0)

    return NextResponse.json({
      success: true,
      message: `Theatre folder creation complete`,
      summary: {
        total: totalFolders,
        created: results.success.length,
        failed: results.failed.length
      },
      results
    })
  } catch (error) {
    console.error('[v0] Theatre folder creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create theatre folders' },
      { status: 500 }
    )
  }
}
