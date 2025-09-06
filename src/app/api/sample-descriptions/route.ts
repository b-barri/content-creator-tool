import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin()
      .from('sample_descriptions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error fetching sample descriptions:', error)
      return NextResponse.json({ error: 'Failed to fetch sample descriptions' }, { status: 500 })
    }

    return NextResponse.json({ success: true, descriptions: data })
  } catch (error) {
    console.error('API error fetching sample descriptions:', error)
    return NextResponse.json({
      error: 'Failed to fetch sample descriptions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { descriptions } = await request.json()
    
    if (!descriptions || !Array.isArray(descriptions) || descriptions.length === 0) {
      return NextResponse.json({ error: 'Descriptions array required' }, { status: 400 })
    }

    // Insert sample descriptions
    const { data, error } = await supabaseAdmin()
      .from('sample_descriptions')
      .insert(descriptions.map(description => ({
        description: description.trim(),
        category: 'user_provided'
      })))
      .select()

    if (error) {
      console.error('Database error inserting sample descriptions:', error)
      return NextResponse.json({ error: 'Failed to save sample descriptions' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully saved ${data.length} sample descriptions`,
      descriptions: data
    })
  } catch (error) {
    console.error('API error saving sample descriptions:', error)
    return NextResponse.json({
      error: 'Failed to save sample descriptions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
