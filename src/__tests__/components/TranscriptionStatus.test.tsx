import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import TranscriptionStatus from '@/components/TranscriptionStatus'

// Mock fetch
global.fetch = jest.fn()

describe('TranscriptionStatus', () => {
  const mockOnTranscriptionComplete = jest.fn()
  const mockOnTranscriptionError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockClear()
  })

  it('renders nothing when videoUrl is not provided', () => {
    render(
      <TranscriptionStatus
        videoUrl=""
        onTranscriptionComplete={mockOnTranscriptionComplete}
        onTranscriptionError={mockOnTranscriptionError}
      />
    )

    expect(screen.queryByText(/transcribing/i)).not.toBeInTheDocument()
  })

  it('shows processing status when transcription starts', async () => {
    ;(fetch as jest.Mock).mockImplementation(() =>
      new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              transcript: 'Test transcript',
              id: 'test-id'
            })
          })
        }, 100)
      })
    )

    render(
      <TranscriptionStatus
        videoUrl="https://example.com/video.mp4"
        onTranscriptionComplete={mockOnTranscriptionComplete}
        onTranscriptionError={mockOnTranscriptionError}
      />
    )

    expect(screen.getByText(/transcribing video/i)).toBeInTheDocument()
    expect(screen.getByText(/this may take a few minutes/i)).toBeInTheDocument()
  })

  it('shows progress bar during processing', async () => {
    ;(fetch as jest.Mock).mockImplementation(() =>
      new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              transcript: 'Test transcript',
              id: 'test-id'
            })
          })
        }, 100)
      })
    )

    render(
      <TranscriptionStatus
        videoUrl="https://example.com/video.mp4"
        onTranscriptionComplete={mockOnTranscriptionComplete}
        onTranscriptionError={mockOnTranscriptionError}
      />
    )

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })
  })

  it('calls onTranscriptionComplete when transcription succeeds', async () => {
    const mockResponse = {
      success: true,
      transcript: 'Test transcript content',
      id: 'test-transcript-id'
    }

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    render(
      <TranscriptionStatus
        videoUrl="https://example.com/video.mp4"
        onTranscriptionComplete={mockOnTranscriptionComplete}
        onTranscriptionError={mockOnTranscriptionError}
      />
    )

    await waitFor(() => {
      expect(mockOnTranscriptionComplete).toHaveBeenCalledWith(
        'Test transcript content',
        'test-transcript-id'
      )
    })

    expect(screen.getByText(/transcription completed successfully/i)).toBeInTheDocument()
  })

  it('calls onTranscriptionError when transcription fails', async () => {
    const mockError = 'Transcription failed'
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: false,
        error: mockError
      })
    })

    render(
      <TranscriptionStatus
        videoUrl="https://example.com/video.mp4"
        onTranscriptionComplete={mockOnTranscriptionComplete}
        onTranscriptionError={mockOnTranscriptionError}
      />
    )

    await waitFor(() => {
      expect(mockOnTranscriptionError).toHaveBeenCalledWith(mockError)
    })

    expect(screen.getByText(/transcription failed/i)).toBeInTheDocument()
  })

  it('handles network errors', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(
      <TranscriptionStatus
        videoUrl="https://example.com/video.mp4"
        onTranscriptionComplete={mockOnTranscriptionComplete}
        onTranscriptionError={mockOnTranscriptionError}
      />
    )

    await waitFor(() => {
      expect(mockOnTranscriptionError).toHaveBeenCalledWith('Network error')
    })

    expect(screen.getByText(/transcription failed/i)).toBeInTheDocument()
  })
})
