import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VideoUpload from '@/components/VideoUpload'

// Mock react-dropzone
const mockUseDropzone = jest.fn()
jest.mock('react-dropzone', () => ({
  useDropzone: (config: any) => mockUseDropzone(config),
}))

// Mock fetch
global.fetch = jest.fn()

// Mock Progress component
jest.mock('@/components/progress', () => ({
  Progress: ({ value, className }: { value: number; className?: string }) => (
    <div data-testid="progress" data-value={value} className={className}>
      Progress: {value}%
    </div>
  ),
}))

describe('VideoUpload Component', () => {
  const mockOnUploadComplete = jest.fn()
  const mockOnUploadError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseDropzone.mockReturnValue({
      getRootProps: jest.fn(() => ({ 'data-testid': 'dropzone' })),
      getInputProps: jest.fn(() => ({ 'data-testid': 'file-input' })),
      isDragActive: false,
      isDragReject: false,
    })
  })

  it('should render upload area', () => {
    render(
      <VideoUpload 
        onUploadComplete={mockOnUploadComplete}
        onUploadError={mockOnUploadError}
      />
    )

    expect(screen.getByText('Drag & drop your video here')).toBeInTheDocument()
    expect(screen.getByText('or click to browse files')).toBeInTheDocument()
    expect(screen.getByText('Supports MP4, MOV, AVI, MKV, WebM, M4V (max 100MB)')).toBeInTheDocument()
  })

  it('should show drag active state', () => {
    mockUseDropzone.mockReturnValue({
      getRootProps: jest.fn(() => ({ 'data-testid': 'dropzone' })),
      getInputProps: jest.fn(() => ({ 'data-testid': 'file-input' })),
      isDragActive: true,
      isDragReject: false,
    })

    render(
      <VideoUpload 
        onUploadComplete={mockOnUploadComplete}
        onUploadError={mockOnUploadError}
      />
    )

    expect(screen.getByText('Drop your video here')).toBeInTheDocument()
  })

  it('should show drag reject state', () => {
    mockUseDropzone.mockReturnValue({
      getRootProps: jest.fn(() => ({ 'data-testid': 'dropzone' })),
      getInputProps: jest.fn(() => ({ 'data-testid': 'file-input' })),
      isDragActive: true,
      isDragReject: true,
    })

    render(
      <VideoUpload 
        onUploadComplete={mockOnUploadComplete}
        onUploadError={mockOnUploadError}
      />
    )

    expect(screen.getByText('File type not supported')).toBeInTheDocument()
  })

  it('should handle successful file upload', async () => {
    const mockFile = new File(['video content'], 'test-video.mp4', { type: 'video/mp4' })
    
    // Mock successful fetch response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({
        success: true,
        fileName: '1234567890-test-video.mp4',
        url: 'https://example.com/videos/1234567890-test-video.mp4',
        size: 1024,
        type: 'video/mp4'
      })
    })

    // Mock useDropzone to simulate file drop
    mockUseDropzone.mockImplementation(({ onDrop }) => {
      // Simulate file drop
      setTimeout(() => onDrop([mockFile]), 0)
      return {
        getRootProps: jest.fn(() => ({ 'data-testid': 'dropzone' })),
        getInputProps: jest.fn(() => ({ 'data-testid': 'file-input' })),
        isDragActive: false,
        isDragReject: false,
      }
    })

    render(
      <VideoUpload 
        onUploadComplete={mockOnUploadComplete}
        onUploadError={mockOnUploadError}
      />
    )

    await waitFor(() => {
      expect(mockOnUploadComplete).toHaveBeenCalledWith({
        success: true,
        fileName: '1234567890-test-video.mp4',
        url: 'https://example.com/videos/1234567890-test-video.mp4',
        size: 1024,
        type: 'video/mp4'
      })
    })
  })

  it('should handle upload error', async () => {
    const mockFile = new File(['video content'], 'test-video.mp4', { type: 'video/mp4' })
    
    // Mock failed fetch response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({
        success: false,
        error: 'Upload failed'
      })
    })

    // Mock useDropzone to simulate file drop
    mockUseDropzone.mockImplementation(({ onDrop }) => {
      setTimeout(() => onDrop([mockFile]), 0)
      return {
        getRootProps: jest.fn(() => ({ 'data-testid': 'dropzone' })),
        getInputProps: jest.fn(() => ({ 'data-testid': 'file-input' })),
        isDragActive: false,
        isDragReject: false,
      }
    })

    render(
      <VideoUpload 
        onUploadComplete={mockOnUploadComplete}
        onUploadError={mockOnUploadError}
      />
    )

    await waitFor(() => {
      expect(mockOnUploadError).toHaveBeenCalledWith('Upload failed')
    })
  })

  it('should handle network error', async () => {
    const mockFile = new File(['video content'], 'test-video.mp4', { type: 'video/mp4' })
    
    // Mock network error
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    // Mock useDropzone to simulate file drop
    mockUseDropzone.mockImplementation(({ onDrop }) => {
      setTimeout(() => onDrop([mockFile]), 0)
      return {
        getRootProps: jest.fn(() => ({ 'data-testid': 'dropzone' })),
        getInputProps: jest.fn(() => ({ 'data-testid': 'file-input' })),
        isDragActive: false,
        isDragReject: false,
      }
    })

    render(
      <VideoUpload 
        onUploadComplete={mockOnUploadComplete}
        onUploadError={mockOnUploadError}
      />
    )

    await waitFor(() => {
      expect(mockOnUploadError).toHaveBeenCalledWith('Upload failed. Please try again.')
    })
  })

  it('should display file information after upload', async () => {
    const mockFile = new File(['video content'], 'test-video.mp4', { type: 'video/mp4' })
    
    // Mock successful fetch response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({
        success: true,
        fileName: '1234567890-test-video.mp4',
        url: 'https://example.com/videos/1234567890-test-video.mp4',
        size: 1024,
        type: 'video/mp4'
      })
    })

    // Mock useDropzone to simulate file drop
    mockUseDropzone.mockImplementation(({ onDrop }) => {
      setTimeout(() => onDrop([mockFile]), 0)
      return {
        getRootProps: jest.fn(() => ({ 'data-testid': 'dropzone' })),
        getInputProps: jest.fn(() => ({ 'data-testid': 'file-input' })),
        isDragActive: false,
        isDragReject: false,
      }
    })

    render(
      <VideoUpload 
        onUploadComplete={mockOnUploadComplete}
        onUploadError={mockOnUploadError}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('test-video.mp4')).toBeInTheDocument()
      expect(screen.getByText('1 KB')).toBeInTheDocument()
    })
  })

  it('should show progress during upload', async () => {
    const mockFile = new File(['video content'], 'test-video.mp4', { type: 'video/mp4' })
    
    // Mock successful fetch response with delay
    ;(global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          json: () => Promise.resolve({
            success: true,
            fileName: '1234567890-test-video.mp4',
            url: 'https://example.com/videos/1234567890-test-video.mp4',
            size: 1024,
            type: 'video/mp4'
          })
        }), 100)
      )
    )

    // Mock useDropzone to simulate file drop
    mockUseDropzone.mockImplementation(({ onDrop }) => {
      setTimeout(() => onDrop([mockFile]), 0)
      return {
        getRootProps: jest.fn(() => ({ 'data-testid': 'dropzone' })),
        getInputProps: jest.fn(() => ({ 'data-testid': 'file-input' })),
        isDragActive: false,
        isDragReject: false,
      }
    })

    render(
      <VideoUpload 
        onUploadComplete={mockOnUploadComplete}
        onUploadError={mockOnUploadError}
      />
    )

    // Check that progress is shown during upload
    await waitFor(() => {
      expect(screen.getByTestId('progress')).toBeInTheDocument()
    })
  })

  it('should format file sizes correctly', async () => {
    const mockFile = new File(['video content'], 'test-video.mp4', { type: 'video/mp4' })
    
    // Mock successful fetch response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({
        success: true,
        fileName: '1234567890-test-video.mp4',
        url: 'https://example.com/videos/1234567890-test-video.mp4',
        size: 1024 * 1024, // 1MB
        type: 'video/mp4'
      })
    })

    // Mock useDropzone to simulate file drop
    mockUseDropzone.mockImplementation(({ onDrop }) => {
      setTimeout(() => onDrop([mockFile]), 0)
      return {
        getRootProps: jest.fn(() => ({ 'data-testid': 'dropzone' })),
        getInputProps: jest.fn(() => ({ 'data-testid': 'file-input' })),
        isDragActive: false,
        isDragReject: false,
      }
    })

    render(
      <VideoUpload 
        onUploadComplete={mockOnUploadComplete}
        onUploadError={mockOnUploadError}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('1 MB')).toBeInTheDocument()
    })
  })
})
