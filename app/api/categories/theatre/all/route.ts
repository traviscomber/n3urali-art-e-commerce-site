import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Fetch all theatre photo categories (start with "Theatre-")
    const { data: theatreCategories, error } = await supabase
      .from('categories')
      .select('id, name, description')
      .like('name', 'Theatre-%')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('[v0] Error fetching theatre categories:', error)
      return NextResponse.json(
        { error: 'Failed to fetch theatre categories' },
        { status: 500 }
      )
    }

    // Group categories by parent (Nature, Culture, Mythic, Art)
    const grouped = {
      nature: theatreCategories.filter(cat => 
        ['Theatre-Ocean-Surreal', 'Theatre-Ocean-Underwater-Life', 'Theatre-Insects', 'Theatre-Beads']
          .includes(cat.name)
      ),
      culture: theatreCategories.filter(cat => 
        ['Theatre-Turkey', 'Theatre-Japan', 'Theatre-Halloween', 'Theatre-Indonesia-Tribes',
         'Theatre-Thailand', 'Theatre-Australia', 'Theatre-Indonesian-Temples', 'Theatre-Africa',
         'Theatre-Chile-Tribes', 'Theatre-Argentina-Rio', 'Theatre-Korea', 'Theatre-Galleries',
         'Theatre-Vietnam-Theatre', 'Theatre-India-Taj-Mahal'].includes(cat.name)
      ),
      mythic: theatreCategories.filter(cat => 
        ['Theatre-Mythic-Indonesia', 'Theatre-Mythic-Chile'].includes(cat.name)
      ),
      art: theatreCategories.filter(cat => 
        ['Theatre-Bosch-Graspher', 'Theatre-Faces', 'Theatre-Golden-Objects', 'Theatre-Shapes',
         'Theatre-Children', 'Theatre-Architecture', 'Theatre-Silver-Techno', 'Theatre-Bifi-Geometry',
         'Theatre-Tunnels', 'Theatre-Uncategorized'].includes(cat.name)
      )
    }

    return NextResponse.json({
      success: true,
      categories: theatreCategories,
      grouped
    })
  } catch (error) {
    console.error('[v0] Theatre categories error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch theatre categories' },
      { status: 500 }
    )
  }
}
