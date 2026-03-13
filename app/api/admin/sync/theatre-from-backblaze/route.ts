import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface B2File {
  fileId: string
  fileName: string
  size: number
  uploadTimestamp: number
  action: string
  contentType: string
}

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

export async function GET() {
  return NextResponse.json({
    message: 'Theatre Backblaze Sync Endpoint',
    description: 'Scans THEATRE/Categories/ folder in Backblaze and imports all images to Supabase',
    usage: 'Make a POST request to this endpoint to start the sync',
    method: 'POST',
  })
}

export async function POST(request: Request) {
  try {
    const { clearExisting } = await request.json().catch(() => ({}))
    
    const apiKey = process.env.BACKBLAZE_API_KEY
    const applicationKey = process.env.BACKBLAZE_APPLICATION_KEY
    const bucketName = process.env.BACKBLAZE_BUCKET_NAME

    if (!apiKey || !applicationKey || !bucketName) {
      return NextResponse.json(
        { error: 'Backblaze credentials not configured' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Clear existing theatre images if requested
    if (clearExisting) {
      console.log('[v0] Clearing existing theatre images from database...')
      const { error: deleteError } = await supabase
        .from('images')
        .delete()
        .eq('image_format', 'equirectangular')
        .like('file_path', 'THEATRE/Categories/%')

      if (deleteError) {
        console.error('[v0] Error clearing existing images:', deleteError)
        return NextResponse.json(
          { error: `Failed to clear existing images: ${deleteError.message}` },
          { status: 500 }
        )
      }
      console.log('[v0] Cleared existing theatre images')
    }

    // Authenticate with B2
    const credentials = Buffer.from(`${apiKey}:${applicationKey}`).toString('base64')
    const authResponse = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    })

    if (!authResponse.ok) {
      throw new Error(`B2 auth failed: ${authResponse.statusText}`)
    }

    const authData = await authResponse.json()
    const { authorizationToken, apiUrl, accountId } = authData

    // Get bucket ID
    const bucketsResponse = await fetch(`${apiUrl}/b2api/v2/b2_list_buckets`, {
      method: 'POST',
      headers: {
        Authorization: authorizationToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accountId }),
    })

    const bucketsData = await bucketsResponse.json()
    const bucket = bucketsData.buckets.find((b: any) => b.bucketName === bucketName)

    if (!bucket) {
      throw new Error(`Bucket ${bucketName} not found`)
    }

    // List all files in THEATRE/Categories/ folder with pagination
    let allFiles: B2File[] = []
    let nextFileName: string | null = null
    let pageCount = 0
    let filesResponse: Response

    do {
      pageCount++
      console.log(`[v0] Fetching page ${pageCount} of files...`)
      
      filesResponse = await fetch(`${apiUrl}/b2api/v2/b2_list_file_names`, {
        method: 'POST',
        headers: {
          Authorization: authorizationToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bucketId: bucket.bucketId,
          startFileName: nextFileName || 'THEATRE/Categories/',
          prefix: 'THEATRE/Categories/',
          maxFileCount: 10000, // Request max files per page
        }),
      })

      const filesData = await filesResponse.json()
      const files = filesData.files || []
      allFiles = allFiles.concat(files)
      nextFileName = filesData.nextFileName || null

      console.log(`[v0] Page ${pageCount}: Got ${files.length} files, next: ${nextFileName ? 'yes' : 'no'}`)

      // Break if no more files
      if (!nextFileName || files.length === 0) {
        break
      }
    } while (nextFileName)

    const files = allFiles

    console.log(`[v0] Found ${files.length} files in THEATRE/Categories/`)

    // Filter to only image files (not .folder_marker)
    const imageFiles = files.filter(
      (f: B2File) =>
        !f.fileName.endsWith('.folder_marker') &&
        (f.fileName.endsWith('.jpg') ||
          f.fileName.endsWith('.jpeg') ||
          f.fileName.endsWith('.png') ||
          f.fileName.endsWith('.webp'))
    )

    console.log(`[v0] Found ${imageFiles.length} image files`)

    // Parse each file to extract category and create database entry
    let imported = 0
    let skipped = 0
    const results = []

    for (const file of imageFiles) {
      // Parse file path: THEATRE/Categories/[Parent]/[Subcategory]/[filename]
      const parts = file.fileName.split('/')
      if (parts.length < 5) continue

      const parent = parts[2] // Nature, Culture, Mythic, or Art
      const subcategory = parts[3] // The specific subcategory
      const filename = parts[4] // The actual filename
      const contentCategory = `${parent}/${subcategory}`

      // Create download URL
      const downloadUrl = `https://f005.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=${file.fileId}`

      // Check if already exists
      const { data: existing } = await supabase
        .from('images')
        .select('id')
        .eq('image_format', 'equirectangular')
        .eq('file_path', file.fileName)
        .single()

      if (existing) {
        skipped++
        results.push({
          file: filename,
          category: contentCategory,
          status: 'skipped',
          reason: 'already_imported',
        })
        continue
      }

      // Insert into database
      const { error: insertError } = await supabase.from('images').insert({
        title: filename.replace(/\.[^/.]+$/, ''), // Remove file extension for title
        description: `Theatre photo - ${contentCategory}`,
        image_format: 'equirectangular',
        content_category: contentCategory,
        file_path: file.fileName,
        original_url: downloadUrl,
        active: true,
        is_featured: false,
      })

      if (insertError) {
        console.error(`[v0] Error inserting ${filename}:`, insertError)
        results.push({
          file: filename,
          category: contentCategory,
          status: 'failed',
          error: insertError.message,
        })
      } else {
        imported++
        results.push({
          file: filename,
          category: contentCategory,
          status: 'imported',
        })
        console.log(`[v0] Imported: ${file.fileName}`)
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalFilesInTheatre: files.length,
        imageFiles: imageFiles.length,
        imported,
        skipped,
        failed: imageFiles.length - imported - skipped,
      },
      results,
    })
  } catch (error) {
    console.error('[v0] Theatre sync error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
