import { NextRequest, NextResponse } from 'next/server'
import { generateTitles } from '@/lib/openai'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { transcript, sampleTitles, transcriptId } = await request.json()
    
    console.log('API: Received request for title generation')
    console.log('API: Sample titles received:', sampleTitles?.length || 0)
    console.log('API: Sample titles:', sampleTitles)
    
    if (!transcript) {
      return NextResponse.json({ error: 'Transcript required' }, { status: 400 })
    }

    // Generate titles using OpenAI with sample analysis
    const titles = await generateTitles(transcript, sampleTitles)
    
    if (!titles || titles.length === 0) {
      return NextResponse.json({ error: 'Failed to generate titles' }, { status: 500 })
    }

    // Store generated titles in database if transcriptId is provided
    if (transcriptId) {
      try {
        const { data, error } = await supabaseAdmin()
          .from('generated_content')
          .upsert({
            transcript_id: transcriptId,
            transcript: transcript,
            generated_titles: titles,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'transcript_id'
          })
          .select()
          .single()

        if (error) {
          console.error('Database error storing titles:', error)
          // Don't fail the request if database storage fails
        }
      } catch (dbError) {
        console.error('Database storage error:', dbError)
        // Continue with response even if database storage fails
      }
    }

    return NextResponse.json({
      success: true,
      titles: titles,
      count: titles.length,
      sampleAnalysis: sampleTitles ? {
        samplesProvided: sampleTitles.length,
        analysisUsed: true
      } : {
        samplesProvided: 0,
        analysisUsed: false
      }
    })

  } catch (error) {
    console.error('Title generation error:', error)
    return NextResponse.json({ 
      error: 'Title generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
