import { NextRequest, NextResponse } from 'next/server'

const CATEGORIES = {
  'Nature': ['Ocean-Surreal', 'Ocean-Underwater-Life', 'Insects', 'Beads'],
  'Culture': ['Turkey', 'Japan', 'Halloween', 'Indonesia-Tribes', 'Thailand', 'Australia', 
              'Indonesian-Temples', 'Africa', 'Chile-Tribes', 'Argentina-Rio', 'Korea', 
              'Galleries', 'Vietnam-Theatre', 'India-Taj-Mahal'],
  'Mythic': ['Mythic-Indonesia', 'Mythic-Chile'],
  'Art': ['Bosch-Graspher', 'Faces', 'Golden-Objects', 'Shapes', 'Children', 'Architecture', 
          'Silver-Techno', 'Bifi-Geometry', 'Tunnels', 'Uncategorized']
}

async function authenticateB2() {
  const response = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(
        `${process.env.BACKBLAZE_API_KEY}:${process.env.BACKBLAZE_APPLICATION_KEY}`
      ).toString('base64'),
    },
  })

  if (!response.ok) {
    throw new Error(`B2 auth failed: ${response.statusText}`)
  }

  return await response.json()
}

async function getBucketId(auth: any) {
  const response = await fetch(
    `${auth.apiUrl}/b2api/v2/b2_list_buckets`,
    {
      method: 'POST',
      headers: {
        'Authorization': auth.authorizationToken,
      },
      body: JSON.stringify({
        accountId: auth.accountId,
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to get buckets: ${response.statusText}`)
  }

  const data = await response.json()
  const bucket = data.buckets.find((b: any) => b.bucketName === 'Neuraliart')
  
  if (!bucket) {
    throw new Error('Bucket "Neuraliart" not found')
  }

  return bucket.bucketId
}

async function createFolder(auth: any, bucketId: string, folderPath: string) {
  const getUrlResponse = await fetch(
    `${auth.apiUrl}/b2api/v2/b2_get_upload_url`,
    {
      method: 'POST',
      headers: {
        'Authorization': auth.authorizationToken,
      },
      body: JSON.stringify({
        bucketId: bucketId,
      }),
    }
  )

  if (!getUrlResponse.ok) {
    throw new Error(`Failed to get upload URL: ${getUrlResponse.statusText}`)
  }

  const uploadInfo = await getUrlResponse.json()
  const markerFile = `${folderPath}/.folder_marker`

  const uploadResponse = await fetch(uploadInfo.uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': uploadInfo.authorizationToken,
      'X-Bz-File-Name': markerFile,
      'Content-Type': 'text/plain',
      'X-Bz-Content-Sha1': 'da39a3ee5e6b4b0d3255bfef95601890afd80709',
    },
    body: '',
  })

  return uploadResponse.ok
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateB2()
    const bucketId = await getBucketId(auth)

    const results = {
      created: 0,
      failed: 0,
      folders: [] as any[],
    }

    // Create all 32 theatre folders
    for (const [parent, subcategories] of Object.entries(CATEGORIES)) {
      for (const subcategory of subcategories) {
        const folderPath = `THEATRE/Categories/${parent}/${subcategory}`

        try {
          const success = await createFolder(auth, bucketId, folderPath)
          if (success) {
            results.created++
            results.folders.push({ path: folderPath, status: 'created' })
          } else {
            results.failed++
            results.folders.push({ path: folderPath, status: 'failed' })
          }
        } catch (error) {
          results.failed++
          results.folders.push({ 
            path: folderPath, 
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
    }

    return NextResponse.json({
      success: results.failed === 0,
      total: 32,
      created: results.created,
      failed: results.failed,
      folders: results.folders,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create folders',
      },
      { status: 500 }
    )
  }
}
