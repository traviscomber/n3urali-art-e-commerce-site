import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const videoFile = formData.get('file') as File
    const categoryId = formData.get('categoryId') as string
    const title = formData.get('title') as string

    if (!videoFile || !categoryId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: file, categoryId, title' },
        { status: 400 }
      )
    }

    // Validate file is a video
    if (!videoFile.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'File must be a video format' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get category name from categoryId
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('name')
      .eq('id', categoryId)
      .single()

    if (categoryError || !category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Map category to parent folder
    const categoryName = category.name
    let parentFolder = 'Art' // default

    const natureCats = ['Ocean-Surreal', 'Ocean-Underwater-Life', 'Insects', 'Beads']
    const cultureCats = ['Turkey', 'Japan', 'Halloween', 'Indonesia-Tribes', 'Thailand', 'Australia', 
                        'Indonesian-Temples', 'Africa', 'Chile-Tribes', 'Argentina-Rio', 'Korea', 
                        'Galleries', 'Vietnam-Theatre', 'India-Taj-Mahal']
    const mythicCats = ['Mythic-Indonesia', 'Mythic-Chile']

    if (natureCats.includes(categoryName)) parentFolder = 'Nature'
    else if (cultureCats.includes(categoryName)) parentFolder = 'Culture'
    else if (mythicCats.includes(categoryName)) parentFolder = 'Mythic'

    // Generate file path: VIDS/Categories/[PARENT]/[CATEGORY]/[FILENAME]
    const timestamp = Date.now()
    const fileName = `${categoryName.toLowerCase()}-${timestamp}.${videoFile.type.split('/')[1] || 'mp4'}`
    const filePath = `VIDS/Categories/${parentFolder}/${categoryName}/${fileName}`

    // Create image record in database
    const { data: imageRecord, error: insertError } = await supabase
      .from('images')
      .insert({
        title,
        file_path: filePath,
        image_format: 'video',
        content_category: 'video',
        category_id: categoryId,
        active: true,
      })
      .select()
      .single()

    if (insertError) {
      console.error('[v0] Error creating image record:', insertError)
      return NextResponse.json(
        { error: 'Failed to create video record' },
        { status: 500 }
      )
    }

    console.log('[v0] Video uploaded successfully:', {
      id: imageRecord.id,
      title,
      category: categoryName,
      filePath,
    })

    return NextResponse.json({
      success: true,
      video: imageRecord,
      uploadPath: filePath,
      message: 'Video uploaded successfully. Upload file to Backblaze at: ' + filePath,
    })
  } catch (error) {
    console.error('[v0] Unexpected error uploading video:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
