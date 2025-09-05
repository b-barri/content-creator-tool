import { NextRequest, NextResponse } from 'next/server'
import { generateDescription } from '@/lib/openai'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { transcript, title, transcriptId } = await request.json()
    
    if (!transcript) {
      return NextResponse.json({ error: 'Transcript required' }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 })
    }

    // Generate description using OpenAI
    const description = await generateDescription(transcript, title)
    
    if (!description) {
      return NextResponse.json({ error: 'Failed to generate description' }, { status: 500 })
    }

    // Store generated description in database if transcriptId is provided
    if (transcriptId) {
      try {
        const { data, error } = await supabaseAdmin
          .from('generated_content')
          .upsert({
            transcript_id: transcriptId,
            transcript: transcript,
            generated_description: description,
            selected_title: title,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'transcript_id'
          })
          .select()
          .single()

        if (error) {
          console.error('Database error storing description:', error)
          // Don't fail the request if database storage fails
        }
      } catch (dbError) {
        console.error('Database storage error:', dbError)
        // Continue with response even if database storage fails
      }
    }

    return NextResponse.json({
      success: true,
      description: description,
      title: title,
      wordCount: description.split(/\s+/).length,
      characterCount: description.length
    })

  } catch (error) {
    console.error('Description generation error:', error)
    return NextResponse.json({ 
      error: 'Description generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
