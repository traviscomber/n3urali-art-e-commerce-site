import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const collectionCode = formData.get('collectionCode') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'File must be a video' }, { status: 400 })
    }

    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File must be smaller than 500MB' },
        { status: 400 }
      )
    }

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Generate filename
    const timestamp = Date.now()
    const sanitizedTitle = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const filename = `${sanitizedTitle}-${timestamp}.${file.name.split('.').pop()}`
    const path = collectionCode ? `videos/${collectionCode}/${filename}` : `videos/${filename}`

    console.log('[v0] Uploading video to Blob:', path)

    // Upload to Vercel Blob
    const blob = await put(path, file, {
      access: 'public',
      contentType: file.type,
    })

    console.log('[v0] Video uploaded successfully:', blob.url)

    return NextResponse.json({
      success: true,
      publicUrl: blob.url,
      message: 'Video uploaded successfully',
    })
  } catch (error) {
    console.error('[v0] Video upload error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Video upload failed',
      },
      { status: 500 }
    )
  }
}
