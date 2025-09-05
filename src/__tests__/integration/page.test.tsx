import { render, screen, waitFor } from '@testing-library/react'
import Home from '@/app/page'

// Mock the VideoUpload component
jest.mock('@/components/VideoUpload', () => {
  return function MockVideoUpload({ onUploadComplete, onUploadError }: any) {
    return (
      <div data-testid="video-upload">
        <button 
          onClick={() => onUploadComplete({
            fileName: 'test-video.mp4',
            url: 'https://example.com/videos/test-video.mp4',
            size: 1024,
            type: 'video/mp4'
          })}
        >
          Simulate Upload
        </button>
        <button 
          onClick={() => onUploadError('Upload failed')}
        >
          Simulate Error
        </button>
      </div>
    )
  }
})

// Mock the TranscriptionStatus component
jest.mock('@/components/TranscriptionStatus', () => {
  return function MockTranscriptionStatus({ videoUrl, onTranscriptionComplete, onTranscriptionError }: any) {
    return (
      <div data-testid="transcription-status">
        <button 
          onClick={() => onTranscriptionComplete('This is a test transcript of the video content.', 'test-id')}
        >
          Simulate Transcription Success
        </button>
        <button 
          onClick={() => onTranscriptionError('Transcription failed')}
        >
          Simulate Transcription Error
        </button>
      </div>
    )
  }
})

// Mock the TranscriptDisplay component
jest.mock('@/components/TranscriptDisplay', () => {
  return function MockTranscriptDisplay({ transcript }: any) {
    return (
      <div data-testid="transcript-display">
        <h2>Transcript</h2>
        <p>{transcript}</p>
      </div>
    )
  }
})

// Mock fetch for API calls
global.fetch = jest.fn()

describe('Home Page Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the main page with all sections', () => {
    render(<Home />)

    expect(screen.getByText('Content Creator Tool')).toBeInTheDocument()
    expect(screen.getByText('Upload Video')).toBeInTheDocument()
    expect(screen.getByTestId('video-upload')).toBeInTheDocument()
  })

  it('should handle successful upload and processing flow', async () => {
    // Mock successful title generation response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({
        success: true,
        titles: [
          {
            title: 'Test Title 1',
            description: 'Test description 1'
          },
          {
            title: 'Test Title 2', 
            description: 'Test description 2'
          }
        ]
      })
    })

    render(<Home />)

    // Simulate successful upload
    const uploadButton = screen.getByText('Simulate Upload')
    uploadButton.click()

    // Wait for transcription status to appear
    await waitFor(() => {
      expect(screen.getByTestId('transcription-status')).toBeInTheDocument()
    })

    // Simulate successful transcription
    const transcriptionButton = screen.getByText('Simulate Transcription Success')
    transcriptionButton.click()

    // Wait for transcript display
    await waitFor(() => {
      expect(screen.getByTestId('transcript-display')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('This is a test transcript of the video content.')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('Generated Titles & Descriptions')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('Test Title 1')).toBeInTheDocument()
      expect(screen.getByText('Test Title 2')).toBeInTheDocument()
    })
  })

  it('should handle upload error', async () => {
    render(<Home />)

    // Simulate upload error
    const errorButton = screen.getByText('Simulate Error')
    errorButton.click()

    await waitFor(() => {
      expect(screen.getByText('Upload failed')).toBeInTheDocument()
    })
  })

  it('should handle transcription failure', async () => {
    render(<Home />)

    // Simulate successful upload
    const uploadButton = screen.getByText('Simulate Upload')
    uploadButton.click()

    // Wait for transcription status to appear
    await waitFor(() => {
      expect(screen.getByTestId('transcription-status')).toBeInTheDocument()
    })

    // Simulate transcription error
    const transcriptionErrorButton = screen.getByText('Simulate Transcription Error')
    transcriptionErrorButton.click()

    await waitFor(() => {
      expect(screen.getByText('Transcription failed')).toBeInTheDocument()
    })
  })

  it('should handle title generation failure', async () => {
    // Mock failed title generation response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({
        success: false,
        error: 'Title generation failed'
      })
    })

    render(<Home />)

    // Simulate successful upload
    const uploadButton = screen.getByText('Simulate Upload')
    uploadButton.click()

    // Wait for transcription status to appear
    await waitFor(() => {
      expect(screen.getByTestId('transcription-status')).toBeInTheDocument()
    })

    // Simulate successful transcription
    const transcriptionButton = screen.getByText('Simulate Transcription Success')
    transcriptionButton.click()

    await waitFor(() => {
      expect(screen.getByText('This is a test transcript of the video content.')).toBeInTheDocument()
    })

    // Title generation failure should not show error message since it's not critical
    await waitFor(() => {
      expect(screen.queryByText('Generated Titles & Descriptions')).not.toBeInTheDocument()
    })
  })

  it('should show processing state during upload', async () => {
    render(<Home />)

    // Simulate upload
    const uploadButton = screen.getByText('Simulate Upload')
    uploadButton.click()

    // Should show transcription status component
    await waitFor(() => {
      expect(screen.getByTestId('transcription-status')).toBeInTheDocument()
    })
  })

  it('should handle network errors gracefully', async () => {
    render(<Home />)

    // Simulate upload
    const uploadButton = screen.getByText('Simulate Upload')
    uploadButton.click()

    // Wait for transcription status to appear
    await waitFor(() => {
      expect(screen.getByTestId('transcription-status')).toBeInTheDocument()
    })

    // Simulate transcription error (which would happen with network issues)
    const transcriptionErrorButton = screen.getByText('Simulate Transcription Error')
    transcriptionErrorButton.click()

    await waitFor(() => {
      expect(screen.getByText('Transcription failed')).toBeInTheDocument()
    })
  })
})
