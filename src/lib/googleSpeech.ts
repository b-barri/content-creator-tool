import { SpeechClient } from '@google-cloud/speech'

// Initialize speech client with proper error handling for deployment
let speechClient: SpeechClient | null = null

function getSpeechClient() {
  if (!speechClient) {
    try {
      // For Vercel deployment, use credentials from environment variables
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
        speechClient = new SpeechClient({
          credentials,
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        })
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // For local development with file path
        speechClient = new SpeechClient({
          keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        })
      } else {
        throw new Error('Google Cloud credentials not configured')
      }
    } catch (error) {
      console.error('Failed to initialize Google Speech client:', error)
      throw new Error('Google Cloud Speech service is not available')
    }
  }
  return speechClient
}

export async function transcribeVideoWithGoogle(videoUrl: string): Promise<string> {
  try {
    console.log('Starting Google Cloud Speech-to-Text transcription for:', videoUrl)
    
    // Download video file
    const fetchResponse = await fetch(videoUrl)
    
    if (!fetchResponse.ok) {
      throw new Error(`Failed to download video: ${fetchResponse.status} ${fetchResponse.statusText}`)
    }
    
    const videoBuffer = await fetchResponse.arrayBuffer()
    
    // Check file size (Google Cloud has a 60-minute limit, roughly 500MB for audio)
    const fileSizeMB = videoBuffer.byteLength / (1024 * 1024)
    console.log(`Video file size: ${fileSizeMB.toFixed(2)}MB`)
    
    if (fileSizeMB > 500) {
      throw new Error(`Video file too large: ${fileSizeMB.toFixed(2)}MB. Maximum size is 500MB.`)
    }
    
    // Convert video buffer to base64
    const audioBytes = Buffer.from(videoBuffer).toString('base64')
    
    console.log('Sending to Google Cloud Speech-to-Text...')
    
    const request = {
      audio: {
        content: audioBytes,
      },
      config: {
        encoding: 'WEBM_OPUS' as const, // Adjust based on your video format
        sampleRateHertz: 16000,
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: true,
        model: 'latest_long', // Best for long-form content
      },
    }
    
    const [response] = await getSpeechClient().recognize(request)
    
    if (!response.results || response.results.length === 0) {
      throw new Error('No transcription results returned')
    }
    
    // Combine all results
    const transcript = response.results
      .map(result => result.alternatives?.[0]?.transcript || '')
      .join(' ')
      .trim()
    
    console.log('Google Cloud Speech-to-Text transcription completed successfully')
    return transcript
    
  } catch (error) {
    console.error('Google Cloud Speech-to-Text error:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('file_size_exceeded')) {
        throw new Error('Video file is too large. Please use a video smaller than 500MB.')
      } else if (error.message.includes('invalid_file_format')) {
        throw new Error('Invalid video format. Please use MP4, MP3, WAV, or other supported formats.')
      } else if (error.message.includes('quota_exceeded')) {
        throw new Error('Google Cloud quota exceeded. Please try again later.')
      } else if (error.message.includes('authentication')) {
        throw new Error('Google Cloud authentication failed. Please check your credentials.')
      }
    }
    
    throw error
  }
}

// Alternative method for streaming (for very large files)
export async function transcribeVideoStreaming(videoUrl: string): Promise<string> {
  try {
    console.log('Starting streaming transcription for:', videoUrl)
    
    const fetchResponse = await fetch(videoUrl)
    if (!fetchResponse.ok) {
      throw new Error(`Failed to download video: ${fetchResponse.status} ${fetchResponse.statusText}`)
    }
    
    const stream = fetchResponse.body
    if (!stream) {
      throw new Error('No response body available')
    }
    
    const recognizeStream = getSpeechClient()
      .streamingRecognize({
        config: {
          encoding: 'WEBM_OPUS' as const,
          sampleRateHertz: 16000,
          languageCode: 'en-US',
          enableAutomaticPunctuation: true,
          model: 'latest_long',
        },
        interimResults: false,
      })
      .on('error', (error) => {
        console.error('Streaming error:', error)
        throw error
      })
    
    // Pipe the audio stream to the recognition stream
    const chunks: string[] = []
    
    recognizeStream.on('data', (data) => {
      if (data.results && data.results[0] && data.results[0].alternatives) {
        const transcript = data.results[0].alternatives[0].transcript
        if (transcript) {
          chunks.push(transcript)
        }
      }
    })
    
    return new Promise((resolve, reject) => {
      recognizeStream.on('end', () => {
        const fullTranscript = chunks.join(' ').trim()
        console.log('Streaming transcription completed')
        resolve(fullTranscript)
      })
      
      recognizeStream.on('error', reject)
      
      // Start the stream
      stream.pipeTo(recognizeStream as any).catch(reject)
    })
    
  } catch (error) {
    console.error('Streaming transcription error:', error)
    throw error
  }
}
