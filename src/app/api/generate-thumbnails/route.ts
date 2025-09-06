import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import getOpenAI from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { 
      transcript, 
      title, 
      transcriptId, 
      prompt,
      channelName,
      channelNiche,
      brandColors
    } = await request.json()
    
    console.log('=== THUMBNAIL GENERATION REQUEST ===')
    console.log('Title:', title)
    console.log('Transcript length:', transcript?.length)
    console.log('TranscriptId:', transcriptId)
    console.log('Custom prompt:', prompt)
    console.log('Channel name:', channelName)
    console.log('Channel niche:', channelNiche)
    console.log('Brand colors:', brandColors)
    
    if (!transcript) {
      return NextResponse.json({ error: 'Transcript required' }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 })
    }

    // Generate thumbnail prompt based on title and transcript with branding
    const thumbnailPrompt = prompt || generateThumbnailPrompt(title, transcript, {
      channelName,
      channelNiche,
      brandColors
    })
    console.log('Generated thumbnail prompt:', thumbnailPrompt)
    
    // Generate thumbnails using DALLE-3
    const thumbnails = await generateThumbnailsWithDALLE3(thumbnailPrompt)
    console.log('Generated thumbnails count:', thumbnails?.length)
    console.log('Thumbnail URLs:', thumbnails?.map(t => t.url))
    
    // Test: Add some working placeholder URLs for debugging
    if (thumbnails && thumbnails.length === 0) {
      console.log('No thumbnails generated, using test placeholders')
      thumbnails.push(
        {
          url: 'https://via.placeholder.com/1792x1024/FF6B6B/FFFFFF?text=Test+Thumbnail+1',
          prompt: thumbnailPrompt,
          style: 'Test Style 1'
        }
      )
    }
    
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

interface BrandingOptions {
  channelName?: string;
  channelNiche?: string;
  brandColors?: string;
}

function generateThumbnailPrompt(title: string, transcript: string, branding?: BrandingOptions): string {
  // Start with neutral, descriptive seed
  let prompt = "Photorealistic YouTube thumbnail on a white background"

  // Conditionally append title (only if title exists)
  if (title && title.trim()) {
    prompt += ` for a video titled '${title}'`
  }

  // Conditionally append branding (only if branding exists)
  if (branding?.channelName && branding?.channelNiche) {
    prompt += ` in the style of ${branding.channelName} (${branding.channelNiche} channel)`
  }

  // Generate short hook from title if it's <= 30 characters
  const shortHook = generateShortHook(title)
  if (shortHook && shortHook.length <= 30) {
    prompt += ` with bold text overlay saying '${shortHook}'`
  }

  // Always add guidance for visual elements
  prompt += "; containing all visual elements from the reference pictures; eye-catching, vibrant colors, high contrast"

  // Add brand constraints if brand colors are provided
  if (branding?.brandColors) {
    prompt += `; prefer accents ${branding.brandColors}; keep text legible at small sizes`
  }

  return prompt
}

function generateShortHook(title: string): string {
  if (!title) return ""
  
  // If title is already short enough, use it
  if (title.length <= 30) {
    return title
  }

  // Extract key words and create a shorter hook
  const stopWords = ['the', 'and', 'for', 'with', 'this', 'that', 'from', 'they', 'have', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'there', 'could', 'other', 'after', 'first', 'well', 'also', 'where', 'much', 'some', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'these', 'how', 'its', 'now', 'find', 'down', 'day', 'did', 'get', 'has', 'had', 'him', 'his', 'man', 'new', 'old', 'see', 'two', 'way', 'who', 'boy', 'let', 'put', 'say', 'she', 'too', 'use']
  
  const keyWords = title.split(' ')
    .filter(word => 
      word.length > 2 && 
      !stopWords.includes(word.toLowerCase())
    )
    .slice(0, 3) // Take top 3 key words

  let hook = keyWords.join(' ')
  
  // If still too long, truncate and add ellipsis
  if (hook.length > 27) {
    hook = hook.substring(0, 27) + "..."
  }
  
  return hook || title.substring(0, 27) + (title.length > 27 ? "..." : "")
}

async function generateThumbnailsWithDALLE3(basePrompt: string) {
  try {
    console.log('=== DALLE-3 GENERATION START ===')
    console.log('OpenAI API Key present:', !!process.env.OPENAI_API_KEY)
    console.log('OpenAI API Key first 10 chars:', process.env.OPENAI_API_KEY?.substring(0, 10))
    console.log('Base prompt:', basePrompt)
    
    const thumbnailStyles = [
      {
        style: 'Bold and Eye-catching',
        promptModifier: 'Bold, vibrant colors, dynamic composition, strong contrast, energetic feel'
      },
      {
        style: 'Clean and Professional', 
        promptModifier: 'Clean, minimalist design, professional colors, sleek typography, corporate aesthetic'
      },
      {
        style: 'Modern and Trendy',
        promptModifier: 'Modern, trendy design, contemporary colors, stylish layout, current design trends'
      }
    ]

    const thumbnails = []

    for (const styleConfig of thumbnailStyles) {
      const enhancedPrompt = `${basePrompt}. ${styleConfig.promptModifier}. High quality, professional thumbnail design, 16:9 aspect ratio, optimized for YouTube platform`
      
      try {
        console.log(`Generating ${styleConfig.style} thumbnail with DALLE-3...`)
        
        const response = await getOpenAI().images.generate({
          model: 'dall-e-3',
          prompt: enhancedPrompt,
          size: '1792x1024',
          quality: 'standard',
          n: 1
        })

        if (response.data && response.data[0] && response.data[0].url) {
          const originalUrl = response.data[0].url
          const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`
          
          thumbnails.push({
            url: proxiedUrl,
            prompt: enhancedPrompt,
            style: styleConfig.style
          })
          console.log(`✅ Successfully generated ${styleConfig.style} thumbnail`)
        }
      } catch (error) {
        console.error(`❌ Error generating ${styleConfig.style} thumbnail:`, error)
        
        // Add a working fallback for this specific style
        thumbnails.push({
          url: `https://httpbin.org/image/png`, // Working fallback URL
          prompt: `Fallback for: ${enhancedPrompt}`,
          style: `${styleConfig.style} (Fallback)`
        })
      }
    }

    return thumbnails
  } catch (error) {
    console.error('DALLE-3 thumbnail generation failed:', error)
    
    // Return working fallback thumbnails if all DALLE-3 calls fail
    return [
      {
        url: 'https://httpbin.org/image/png',
        prompt: basePrompt,
        style: 'Bold and Eye-catching (Service Unavailable)'
      },
      {
        url: 'https://httpbin.org/image/png',
        prompt: basePrompt,
        style: 'Clean and Professional (Service Unavailable)'
      },
      {
        url: 'https://httpbin.org/image/png',
        prompt: basePrompt,
        style: 'Modern and Trendy (Service Unavailable)'
      }
    ]
  }
}
