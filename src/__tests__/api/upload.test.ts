import { NextRequest } from 'next/server'
import { POST } from '@/app/api/upload/route'
import { supabase } from '@/lib/supabase'

// Mock Supabase
const mockSupabaseStorage = {
  from: jest.fn(),
}

jest.mock('@/lib/supabase', () => ({
  supabase: {
    storage: mockSupabaseStorage,
  },
}))

const mockSupabase = mockSupabaseStorage as jest.Mocked<typeof mockSupabaseStorage>

describe('/api/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 400 when no file is provided', async () => {
    const formData = new FormData()
    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('No file provided')
  })

  it('should return 400 when file is not a video', async () => {
    const formData = new FormData()
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    formData.append('file', file)

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('File must be a video')
  })

  it('should return 400 when file is too large', async () => {
    const formData = new FormData()
    // Create a file larger than 100MB
    const largeContent = new Array(101 * 1024 * 1024).fill('a').join('')
    const file = new File([largeContent], 'large-video.mp4', { type: 'video/mp4' })
    formData.append('file', file)

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('File too large (max 100MB)')
  })

  it('should successfully upload a valid video file', async () => {
    const mockUpload = jest.fn().mockResolvedValue({
      data: { path: '1234567890-test-video.mp4' },
      error: null,
    })
    
    const mockGetPublicUrl = jest.fn().mockReturnValue({
      data: { publicUrl: 'https://example.com/videos/1234567890-test-video.mp4' },
    })

    mockSupabase.storage.from.mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    } as any)

    const formData = new FormData()
    const file = new File(['video content'], 'test-video.mp4', { type: 'video/mp4' })
    formData.append('file', file)

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.fileName).toBe('1234567890-test-video.mp4')
    expect(data.url).toBe('https://example.com/videos/1234567890-test-video.mp4')
    expect(data.size).toBe(file.size)
    expect(data.type).toBe('video/mp4')
    
    expect(mockSupabase.storage.from).toHaveBeenCalledWith('videos')
    expect(mockUpload).toHaveBeenCalledWith(expect.stringMatching(/^\d+-test-video\.mp4$/), file)
    expect(mockGetPublicUrl).toHaveBeenCalledWith(expect.stringMatching(/^\d+-test-video\.mp4$/))
  })

  it('should return 500 when Supabase upload fails', async () => {
    const mockUpload = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Storage error' },
    })

    mockSupabase.storage.from.mockReturnValue({
      upload: mockUpload,
    } as any)

    const formData = new FormData()
    const file = new File(['video content'], 'test-video.mp4', { type: 'video/mp4' })
    formData.append('file', file)

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Upload failed')
  })

  it('should handle unexpected errors gracefully', async () => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    mockSupabase.storage.from.mockImplementation(() => {
      throw new Error('Unexpected error')
    })

    const formData = new FormData()
    const file = new File(['video content'], 'test-video.mp4', { type: 'video/mp4' })
    formData.append('file', file)

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('should generate unique filenames with timestamps', async () => {
    const mockUpload = jest.fn().mockResolvedValue({
      data: { path: '1234567890-test-video.mp4' },
      error: null,
    })
    
    const mockGetPublicUrl = jest.fn().mockReturnValue({
      data: { publicUrl: 'https://example.com/videos/1234567890-test-video.mp4' },
    })

    mockSupabase.storage.from.mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    } as any)

    const formData = new FormData()
    const file = new File(['video content'], 'test-video.mp4', { type: 'video/mp4' })
    formData.append('file', file)

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    })

    await POST(request)

    // Verify that the filename includes a timestamp
    expect(mockUpload).toHaveBeenCalledWith(
      expect.stringMatching(/^\d+-test-video\.mp4$/),
      file
    )
  })
})
