import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface B2AuthResponse {
  authorizationToken: string
  apiUrl: string
  downloadUrl: string
  accountId: string
}

interface B2UploadUrlResponse {
  uploadUrl: string
  authorizationToken: string
  bucketId: string
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!file || !category) {
      return NextResponse.json(
        { error: 'File and category are required' },
        { status: 400 }
      )
    }

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Map category name to Backblaze folder path
    const categoryPath = `THEATRE/Categories/${category}`

    console.log('[v0] Theatre photo upload - Category:', category)
    console.log('[v0] Theatre photo upload - Path:', categoryPath)

    // Authenticate with Backblaze B2
    const b2ApiKey = process.env.BACKBLAZE_API_KEY
    const b2AppKey = process.env.BACKBLAZE_APPLICATION_KEY
    const bucketName = process.env.BACKBLAZE_BUCKET_NAME || 'Neuraliart'

    if (!b2ApiKey || !b2AppKey) {
      console.error('[v0] Missing B2 credentials')
      return NextResponse.json(
        { error: 'Backblaze credentials not configured' },
        { status: 500 }
      )
    }

    // Step 1: Authorize with B2
    const authUrl = 'https://api.backblazeb2.com/b2api/v2/b2_authorize_account'
    const credentials = Buffer.from(`${b2ApiKey}:${b2AppKey}`).toString('base64')

    const authResponse = await fetch(authUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`
      }
    })

    if (!authResponse.ok) {
      console.error('[v0] B2 auth failed:', authResponse.statusText)
      return NextResponse.json(
        { error: 'Backblaze authentication failed' },
        { status: 500 }
      )
    }

    const authData = (await authResponse.json()) as B2AuthResponse
    const apiUrl = authData.apiUrl
    const authToken = authData.authorizationToken
    const accountId = authData.accountId

    console.log('[v0] B2 authenticated successfully')

    // Step 2: Get bucket ID
    const bucketsUrl = `${apiUrl}/b2api/v2/b2_list_buckets`
    const bucketsResponse = await fetch(bucketsUrl, {
      method: 'POST',
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ accountId })
    })

    if (!bucketsResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to list buckets' },
        { status: 500 }
      )
    }

    const bucketsData = (await bucketsResponse.json()) as any
    const bucket = bucketsData.buckets.find((b: any) => b.bucketName === bucketName)

    if (!bucket) {
      return NextResponse.json(
        { error: `Bucket ${bucketName} not found` },
        { status: 500 }
      )
    }

    const bucketId = bucket.bucketId
    console.log('[v0] Found bucket:', bucketId)

    // Step 3: Get upload URL
    const uploadUrlEndpoint = `${apiUrl}/b2api/v2/b2_get_upload_url`
    const uploadUrlResponse = await fetch(uploadUrlEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bucketId })
    })

    if (!uploadUrlResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to get upload URL' },
        { status: 500 }
      )
    }

    const uploadUrlData = (await uploadUrlResponse.json()) as B2UploadUrlResponse
    const uploadUrl = uploadUrlData.uploadUrl
    const uploadToken = uploadUrlData.authorizationToken

    console.log('[v0] Got upload URL')

    // Step 4: Upload file to B2
    const fileName = `${categoryPath}/${file.name}`
    const buffer = await file.arrayBuffer()

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': uploadToken,
        'X-Bz-File-Name': fileName,
        'Content-Type': file.type,
        'X-Bz-Content-Sha1': 'unverified'
      },
      body: buffer
    })

    if (!uploadResponse.ok) {
      console.error('[v0] B2 upload failed:', uploadResponse.statusText)
      return NextResponse.json(
        { error: 'Failed to upload to Backblaze' },
        { status: 500 }
      )
    }

    const uploadedFile = (await uploadResponse.json()) as any
    const downloadUrl = `${authData.downloadUrl}/file/${bucketName}/${fileName}`

    console.log('[v0] File uploaded successfully:', downloadUrl)

    // Step 5: Save to Supabase database
    const supabase = await createClient()

    const { data: savedImage, error: dbError } = await supabase
      .from('images')
      .insert({
        title: title || file.name,
        description,
        image_format: 'equirectangular',
        content_category: category,
        file_path: fileName,
        original_url: downloadUrl,
        active: true,
        is_featured: false
      })
      .select()
      .single()

    if (dbError) {
      console.error('[v0] Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save to database' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Theatre photo uploaded successfully',
      image: savedImage,
      backblazePath: fileName,
      downloadUrl
    })
  } catch (error) {
    console.error('[v0] Theatre photo upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
