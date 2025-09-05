import { NextRequest, NextResponse } from 'next/server'
import { generateTitles, generateDescription } from '@/lib/openai'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { transcript, sampleTitles } = await request.json()
    
    if (!transcript) {
      return NextResponse.json({ error: 'Transcript required' }, { status: 400 })
    }
    
    // Generate titles
    const titles = await generateTitles(transcript, sampleTitles)
    
    if (!titles || titles.length === 0) {
      return NextResponse.json({ error: 'Failed to generate titles' }, { status: 500 })
    }
    
    // Generate descriptions for each title
    const titleDescriptions = await Promise.all(
      titles.map(async (title: string) => {
        const description = await generateDescription(transcript, title)
        return {
          title,
          description
        }
      })
    )
    
    // Store generated content in database
    const { data, error } = await supabase
      .from('generated_content')
      .insert({
        transcript: transcript,
        generated_titles: titleDescriptions,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      // Don't fail the request if database save fails
    }
    
    return NextResponse.json({
      success: true,
      titles: titleDescriptions,
      id: data?.id
    })
    
  } catch (error) {
    console.error('Title generation error:', error)
    return NextResponse.json({ error: 'Title generation failed' }, { status: 500 })
  }
}
