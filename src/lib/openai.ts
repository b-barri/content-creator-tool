import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default openai

// Transcription function
export async function transcribeVideo(videoUrl: string) {
  try {
    console.log('Starting transcription for:', videoUrl)
    
    // Download video file
    const response = await fetch(videoUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status} ${response.statusText}`)
    }
    
    const videoBuffer = await response.arrayBuffer()
    
    // Check file size (OpenAI has a 25MB limit)
    const fileSizeMB = videoBuffer.byteLength / (1024 * 1024)
    if (fileSizeMB > 25) {
      throw new Error(`Video file too large: ${fileSizeMB.toFixed(2)}MB. Maximum size is 25MB.`)
    }
    
    console.log(`Video file size: ${fileSizeMB.toFixed(2)}MB`)
    
    // Create a File object for OpenAI
    const videoFile = new File([videoBuffer], 'video.mp4', { 
      type: 'video/mp4' 
    })
    
    console.log('Sending to OpenAI Whisper...')
    
    const transcription = await openai.audio.transcriptions.create({
      file: videoFile,
      model: 'whisper-1',
      response_format: 'text',
      language: 'en', // You can make this configurable
    })
    
    console.log('Transcription completed successfully')
    return transcription
  } catch (error) {
    console.error('Transcription error:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('file_size_exceeded')) {
        throw new Error('Video file is too large. Please use a video smaller than 25MB.')
      } else if (error.message.includes('invalid_file_format')) {
        throw new Error('Invalid video format. Please use MP4, MP3, WAV, or other supported formats.')
      } else if (error.message.includes('rate_limit_exceeded')) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.')
      }
    }
    
    throw error
  }
}

// Title generation function
export async function generateTitles(transcript: string, sampleTitles?: string[]) {
  try {
    const prompt = `
      Based on this video transcript:
      ${transcript}
      
      ${sampleTitles ? `And these successful YouTube titles as examples:
      ${sampleTitles.join('\n')}` : ''}
      
      Generate 5 YouTube title variations that:
      1. Are 50-60 characters long
      2. Are click-worthy and engaging
      3. Include relevant keywords
      4. Follow YouTube best practices
      
      Return only the titles, one per line.
    `
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
    })
    
    return completion.choices[0].message.content?.split('\n').filter(title => title.trim())
  } catch (error) {
    console.error('Title generation error:', error)
    throw error
  }
}

// Description generation function
export async function generateDescription(transcript: string, title: string) {
  try {
    const prompt = `
      Create a YouTube description for this video:
      
      Title: ${title}
      Transcript: ${transcript}
      
      The description should:
      1. Be 200-300 words
      2. Include relevant keywords
      3. Have a clear structure with timestamps if applicable
      4. Include a call-to-action
      5. Be optimized for YouTube SEO
      
      Format it properly with line breaks.
    `
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    })
    
    return completion.choices[0].message.content
  } catch (error) {
    console.error('Description generation error:', error)
    throw error
  }
}
