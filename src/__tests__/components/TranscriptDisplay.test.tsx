import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import TranscriptDisplay from '@/components/TranscriptDisplay'

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
})

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url')
global.URL.revokeObjectURL = jest.fn()

describe('TranscriptDisplay', () => {
  const mockTranscript = 'This is a test transcript with multiple lines.\n\nIt has some content that should be displayed properly.'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders transcript content', () => {
    render(<TranscriptDisplay transcript={mockTranscript} />)

    expect(screen.getByText('Transcript')).toBeInTheDocument()
    expect(screen.getByText(/this is a test transcript/i)).toBeInTheDocument()
  })

  it('displays video URL when provided', () => {
    const videoUrl = 'https://example.com/video.mp4'
    render(<TranscriptDisplay transcript={mockTranscript} videoUrl={videoUrl} />)

    expect(screen.getByText(videoUrl)).toBeInTheDocument()
  })

  it('shows word and character count', () => {
    render(<TranscriptDisplay transcript={mockTranscript} />)

    expect(screen.getByText(/17 words, 108 characters/)).toBeInTheDocument()
  })

  it('shows current date and time', () => {
    render(<TranscriptDisplay transcript={mockTranscript} />)

    const currentDate = new Date().toLocaleDateString()
    const currentTime = new Date().toLocaleTimeString()
    
    expect(screen.getByText(new RegExp(currentDate))).toBeInTheDocument()
    expect(screen.getByText(new RegExp(currentTime))).toBeInTheDocument()
  })

  it('copies transcript to clipboard when copy button is clicked', async () => {
    render(<TranscriptDisplay transcript={mockTranscript} />)

    const copyButton = screen.getByText('Copy')
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockTranscript)
    })

    expect(screen.getByText('Copied!')).toBeInTheDocument()
  })

  it('downloads transcript when download button is clicked', () => {
    // Mock document.createElement and appendChild
    const mockAnchor = {
      href: '',
      download: '',
      click: jest.fn(),
    }
    const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any)
    const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any)
    const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as any)

    render(<TranscriptDisplay transcript={mockTranscript} />)

    const downloadButton = screen.getByText('Download')
    fireEvent.click(downloadButton)

    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(mockAnchor.download).toMatch(/transcript-\d+\.txt/)
    expect(mockAnchor.click).toHaveBeenCalled()
    expect(appendChildSpy).toHaveBeenCalled()
    expect(removeChildSpy).toHaveBeenCalled()

    createElementSpy.mockRestore()
    appendChildSpy.mockRestore()
    removeChildSpy.mockRestore()
  })

  it('formats transcript with proper line breaks', () => {
    const multiLineTranscript = 'Line 1\nLine 2\n\nLine 3'
    render(<TranscriptDisplay transcript={multiLineTranscript} />)

    // Check that the content is properly formatted
    const transcriptContainer = screen.getByText(/line 1/i).closest('div')
    expect(transcriptContainer).toBeInTheDocument()
  })

  it('handles empty transcript gracefully', () => {
    render(<TranscriptDisplay transcript="" />)

    expect(screen.getByText('Transcript')).toBeInTheDocument()
    expect(screen.getByText(/0 words, 0 characters/)).toBeInTheDocument()
  })

  it('resets copy button state after 2 seconds', async () => {
    jest.useFakeTimers()
    
    render(<TranscriptDisplay transcript={mockTranscript} />)

    const copyButton = screen.getByText('Copy')
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })

    // Fast-forward time
    jest.advanceTimersByTime(2000)

    await waitFor(() => {
      expect(screen.getByText('Copy')).toBeInTheDocument()
    })

    jest.useRealTimers()
  })
})
