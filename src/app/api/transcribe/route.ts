import { NextRequest, NextResponse } from 'next/server'
import { transcribeVideo } from '@/lib/openai'
import { transcribeVideoWithGoogle } from '@/lib/googleSpeech'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, useGoogle = true } = await request.json()
    
    if (!videoUrl) {
      return NextResponse.json({ error: 'Video URL required' }, { status: 400 })
    }

    // Check if transcription already exists
    const { data: existingTranscription } = await supabaseAdmin()
      .from('transcriptions')
      .select('*')
      .eq('video_url', videoUrl)
      .eq('status', 'completed')
      .single()

    if (existingTranscription) {
      return NextResponse.json({
        success: true,
        transcript: existingTranscription.transcript,
        id: existingTranscription.id,
        cached: true
      })
    }

    // Create initial record with pending status
    const { data: transcriptionRecord, error: insertError } = await supabaseAdmin()
      .from('transcriptions')
      .insert({
        video_url: videoUrl,
        status: 'processing'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database error creating record:', insertError)
      return NextResponse.json({ error: 'Failed to create transcription record' }, { status: 500 })
    }

    try {
      // Transcribe the video using OpenAI Whisper (temporarily disabled Google Cloud)
      const transcript = await transcribeVideo(videoUrl)
      
      // Update record with transcript
      const { data, error: updateError } = await supabaseAdmin()
        .from('transcriptions')
        .update({
          transcript: transcript,
          status: 'completed'
        })
        .eq('id', transcriptionRecord.id)
        .select()
        .single()
      
      if (updateError) {
        console.error('Database error updating record:', updateError)
        return NextResponse.json({ error: 'Failed to save transcript' }, { status: 500 })
      }
      
      return NextResponse.json({
        success: true,
        transcript: transcript,
        id: data.id,
        cached: false
      })

            } catch (transcriptionError) {
          // Update record with error status
          await supabaseAdmin()
            .from('transcriptions')
            .update({
              status: 'failed',
              error_message: transcriptionError instanceof Error ? transcriptionError.message : 'Unknown error'
            })
            .eq('id', transcriptionRecord.id)

      console.error('Transcription error:', transcriptionError)
      return NextResponse.json({ 
        error: 'Transcription failed', 
        details: transcriptionError instanceof Error ? transcriptionError.message : 'Unknown error'
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
