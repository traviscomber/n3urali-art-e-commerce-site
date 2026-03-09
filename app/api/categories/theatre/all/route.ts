import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Fetch ALL categories to see what's available
    const { data: allCategories } = await supabase
      .from('categories')
      .select('id, name, description')
      .order('name', { ascending: true })

    console.log('[v0] All categories in DB:', allCategories?.map(c => c.name).join(', '))
    
    // Fetch theatre categories (look for both Theatre- prefix and plain category names)
    const { data: theatreCategories, error } = await supabase
      .from('categories')
      .select('id, name, description')
      .or(`name.like.Theatre-%,name.like.Art%,name.like.Nature%,name.like.Culture%,name.like.Mythic%`)
      .order('name', { ascending: true })
    
    if (error) {
      console.error('[v0] Error fetching theatre categories:', error)
      return NextResponse.json(
        { error: 'Failed to fetch theatre categories' },
        { status: 500 }
      )
    }

    console.log('[v0] Theatre categories found:', theatreCategories?.map(c => c.name).join(', '))

    // Group categories by parent (Nature, Culture, Mythic, Art)
    const grouped = {
      nature: theatreCategories.filter(cat => 
        ['Theatre-Ocean-Surreal', 'Theatre-Ocean-Underwater-Life', 'Theatre-Insects', 'Theatre-Beads', 'Nature/Ocean-Surreal', 'Nature/Ocean-Underwater-Life', 'Nature/Insects', 'Nature/Beads']
          .includes(cat.name)
      ),
      culture: theatreCategories.filter(cat => 
        ['Theatre-Turkey', 'Theatre-Japan', 'Theatre-Halloween', 'Theatre-Indonesia-Tribes',
         'Theatre-Thailand', 'Theatre-Australia', 'Theatre-Indonesian-Temples', 'Theatre-Africa',
         'Theatre-Chile-Tribes', 'Theatre-Argentina-Rio', 'Theatre-Korea', 'Theatre-Galleries',
         'Theatre-Vietnam-Theatre', 'Theatre-India-Taj-Mahal',
         'Culture/Turkey', 'Culture/Japan', 'Culture/Halloween', 'Culture/Indonesia-Tribes',
         'Culture/Thailand', 'Culture/Australia', 'Culture/Indonesian-Temples', 'Culture/Africa',
         'Culture/Chile-Tribes', 'Culture/Argentina-Rio', 'Culture/Korea', 'Culture/Galleries',
         'Culture/Vietnam-Theatre', 'Culture/India-Taj-Mahal'].includes(cat.name)
      ),
      mythic: theatreCategories.filter(cat => 
        ['Theatre-Mythic-Indonesia', 'Theatre-Mythic-Chile', 'Mythic/Mythic-Indonesia', 'Mythic/Mythic-Chile'].includes(cat.name)
      ),
      art: theatreCategories.filter(cat => 
        ['Theatre-Bosch-Graspher', 'Theatre-Faces', 'Theatre-Golden-Objects', 'Theatre-Shapes',
         'Theatre-Children', 'Theatre-Architecture', 'Theatre-Silver-Techno', 'Theatre-Bifi-Geometry',
         'Theatre-Tunnels', 'Theatre-Uncategorized',
         'Art/Bosch-Graspher', 'Art/Faces', 'Art/Golden-Objects', 'Art/Shapes',
         'Art/Children', 'Art/Architecture', 'Art/Silver-Techno', 'Art/Bifi-Geometry',
         'Art/Tunnels', 'Art/Uncategorized'].includes(cat.name)
      )
    }

    return NextResponse.json({
      success: true,
      categories: theatreCategories,
      grouped,
      debug: {
        totalInDB: allCategories?.length,
        allCategoryNames: allCategories?.map(c => c.name)
      }
    })
  } catch (error) {
    console.error('[v0] Theatre categories error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch theatre categories' },
      { status: 500 }
    )
  }
}
