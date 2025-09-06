import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Retrieve sample titles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabaseAdmin()
      .from('sample_titles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error fetching sample titles:', error)
      return NextResponse.json({ error: 'Failed to fetch sample titles' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      sampleTitles: data || [],
      count: data?.length || 0
    })

  } catch (error) {
    console.error('Error fetching sample titles:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch sample titles',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Add new sample titles
export async function POST(request: NextRequest) {
  try {
    const { titles, category, performanceMetrics } = await request.json()
    
    if (!titles || !Array.isArray(titles) || titles.length === 0) {
      return NextResponse.json({ error: 'Titles array required' }, { status: 400 })
    }

    // Prepare data for batch insert
    const sampleTitlesData = titles.map(title => ({
      title: title.trim(),
      category: category || 'general',
      performance_metrics: performanceMetrics || null
    }))

    const { data, error } = await supabaseAdmin()
      .from('sample_titles')
      .insert(sampleTitlesData)
      .select()

    if (error) {
      console.error('Database error inserting sample titles:', error)
      return NextResponse.json({ error: 'Failed to save sample titles' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      sampleTitles: data,
      count: data?.length || 0,
      message: `Successfully added ${data?.length || 0} sample titles`
    })

  } catch (error) {
    console.error('Error adding sample titles:', error)
    return NextResponse.json({ 
      error: 'Failed to add sample titles',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE - Remove sample titles
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const category = searchParams.get('category')

    if (!id && !category) {
      return NextResponse.json({ error: 'ID or category required for deletion' }, { status: 400 })
    }

    let query = supabaseAdmin().from('sample_titles').delete()

    if (id) {
      query = query.eq('id', id)
    } else if (category) {
      query = query.eq('category', category)
    }

    const { error } = await query

    if (error) {
      console.error('Database error deleting sample titles:', error)
      return NextResponse.json({ error: 'Failed to delete sample titles' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Sample titles deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting sample titles:', error)
    return NextResponse.json({ 
      error: 'Failed to delete sample titles',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
