import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { transcript, title, transcriptId, prompt } = await request.json()
    
    if (!transcript) {
      return NextResponse.json({ error: 'Transcript required' }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 })
    }

    // Generate thumbnail prompt based on title and transcript
    const thumbnailPrompt = prompt || generateThumbnailPrompt(title, transcript)
    
    // For now, we'll create placeholder thumbnails
    // In a full implementation, you would integrate with Hugging Face Stable Diffusion
    const thumbnails = await generatePlaceholderThumbnails(thumbnailPrompt)
    
    if (!thumbnails || thumbnails.length === 0) {
      return NextResponse.json({ error: 'Failed to generate thumbnails' }, { status: 500 })
    }

    // Store generated thumbnails in database if transcriptId is provided
    if (transcriptId) {
      try {
        for (const thumbnail of thumbnails) {
          await supabaseAdmin
            .from('thumbnails')
            .insert({
              transcript_id: transcriptId,
              image_url: thumbnail.url,
              prompt: thumbnail.prompt
            })
        }
      } catch (dbError) {
        console.error('Database storage error:', dbError)
        // Continue with response even if database storage fails
      }
    }

    return NextResponse.json({
      success: true,
      thumbnails: thumbnails,
      count: thumbnails.length,
      prompt: thumbnailPrompt
    })

  } catch (error) {
    console.error('Thumbnail generation error:', error)
    return NextResponse.json({ 
      error: 'Thumbnail generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function generateThumbnailPrompt(title: string, transcript: string): string {
  // Extract key concepts from title and transcript
  const keyWords = title.split(' ').filter(word => 
    word.length > 3 && 
    !['the', 'and', 'for', 'with', 'this', 'that', 'from', 'they', 'have', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'there', 'could', 'other', 'after', 'first', 'well', 'also', 'where', 'much', 'some', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'these', 'so', 'use', 'her', 'him', 'two', 'more', 'go', 'no', 'way', 'may', 'say', 'she', 'use', 'her', 'his', 'how', 'its', 'now', 'find', 'long', 'down', 'day', 'did', 'get', 'has', 'had', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word.toLowerCase())
  ).slice(0, 5)

  return `YouTube thumbnail for "${title}": ${keyWords.join(', ')}. High contrast, bold text, engaging visual, professional design, click-worthy`
}

async function generatePlaceholderThumbnails(prompt: string) {
  // This is a placeholder implementation
  // In a real implementation, you would call Hugging Face Stable Diffusion API
  
  const thumbnails = [
    {
      url: `https://via.placeholder.com/1280x720/FF6B6B/FFFFFF?text=${encodeURIComponent(prompt.split(':')[0])}`,
      prompt: prompt,
      style: 'Bold and Eye-catching'
    },
    {
      url: `https://via.placeholder.com/1280x720/4ECDC4/FFFFFF?text=${encodeURIComponent(prompt.split(':')[0])}`,
      prompt: prompt,
      style: 'Clean and Professional'
    },
    {
      url: `https://via.placeholder.com/1280x720/45B7D1/FFFFFF?text=${encodeURIComponent(prompt.split(':')[0])}`,
      prompt: prompt,
      style: 'Modern and Trendy'
    }
  ]

  return thumbnails
}
