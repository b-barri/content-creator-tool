import { POST } from '@/app/api/transcribe/route'
import { NextRequest } from 'next/server'
import { transcribeVideo } from '@/lib/openai'
import { supabase } from '@/lib/supabase'

// Mock dependencies
jest.mock('@/lib/openai')
jest.mock('@/lib/supabase')

const mockTranscribeVideo = transcribeVideo as jest.MockedFunction<typeof transcribeVideo>
const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe('/api/transcribe', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns error when videoUrl is not provided', async () => {
    const request = new NextRequest('http://localhost:3000/api/transcribe', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Video URL required')
  })

  it('returns cached transcription if it already exists', async () => {
    const videoUrl = 'https://example.com/video.mp4'
    const existingTranscription = {
      id: 'existing-id',
      transcript: 'Cached transcript',
      status: 'completed'
    }

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: existingTranscription,
              error: null
            })
          })
        })
      })
    } as any)

    const request = new NextRequest('http://localhost:3000/api/transcribe', {
      method: 'POST',
      body: JSON.stringify({ videoUrl }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.transcript).toBe('Cached transcript')
    expect(data.cached).toBe(true)
    expect(mockTranscribeVideo).not.toHaveBeenCalled()
  })

  it('creates new transcription record and processes video', async () => {
    const videoUrl = 'https://example.com/video.mp4'
    const transcript = 'New transcript content'
    const transcriptionId = 'new-transcription-id'

    // Mock no existing transcription
    mockSupabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      })
    } as any)

    // Mock creating new record
    mockSupabase.from.mockReturnValueOnce({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: transcriptionId },
            error: null
          })
        })
      })
    } as any)

    // Mock transcription function
    mockTranscribeVideo.mockResolvedValue(transcript)

    // Mock updating record
    mockSupabase.from.mockReturnValueOnce({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: transcriptionId, transcript, status: 'completed' },
              error: null
            })
          })
        })
      })
    } as any)

    const request = new NextRequest('http://localhost:3000/api/transcribe', {
      method: 'POST',
      body: JSON.stringify({ videoUrl }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.transcript).toBe(transcript)
    expect(data.cached).toBe(false)
    expect(mockTranscribeVideo).toHaveBeenCalledWith(videoUrl)
  })

  it('handles transcription errors and updates record status', async () => {
    const videoUrl = 'https://example.com/video.mp4'
    const transcriptionId = 'transcription-id'
    const transcriptionError = new Error('Transcription failed')

    // Mock no existing transcription
    mockSupabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      })
    } as any)

    // Mock creating new record
    mockSupabase.from.mockReturnValueOnce({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: transcriptionId },
            error: null
          })
        })
      })
    } as any)

    // Mock transcription function to throw error
    mockTranscribeVideo.mockRejectedValue(transcriptionError)

    // Mock updating record with error
    mockSupabase.from.mockReturnValueOnce({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      })
    } as any)

    const request = new NextRequest('http://localhost:3000/api/transcribe', {
      method: 'POST',
      body: JSON.stringify({ videoUrl }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Transcription failed')
    expect(data.details).toBe('Transcription failed')
  })

  it('handles database errors when creating record', async () => {
    const videoUrl = 'https://example.com/video.mp4'
    const dbError = new Error('Database connection failed')

    // Mock no existing transcription
    mockSupabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      })
    } as any)

    // Mock creating new record to fail
    mockSupabase.from.mockReturnValueOnce({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: dbError
          })
        })
      })
    } as any)

    const request = new NextRequest('http://localhost:3000/api/transcribe', {
      method: 'POST',
      body: JSON.stringify({ videoUrl }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to create transcription record')
  })

  it('handles unexpected errors', async () => {
    const videoUrl = 'https://example.com/video.mp4'

    // Mock supabase to throw error
    mockSupabase.from.mockImplementation(() => {
      throw new Error('Unexpected error')
    })

    const request = new NextRequest('http://localhost:3000/api/transcribe', {
      method: 'POST',
      body: JSON.stringify({ videoUrl }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Unexpected error occurred')
    expect(data.details).toBe('Unexpected error')
  })
})
