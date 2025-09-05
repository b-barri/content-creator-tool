'use client'

import { useState, useEffect, useRef } from 'react'

interface TranscriptionStatusProps {
  videoUrl: string
  onTranscriptionComplete: (transcript: string, id: string) => void
  onTranscriptionError: (error: string) => void
}

export default function TranscriptionStatus({ 
  videoUrl, 
  onTranscriptionComplete, 
  onTranscriptionError 
}: TranscriptionStatusProps) {
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const hasStarted = useRef(false)

  useEffect(() => {
    if (videoUrl && !hasStarted.current && status === 'idle') {
      hasStarted.current = true
      startTranscription()
    }
  }, [videoUrl, status])

  const startTranscription = async () => {
    // Prevent multiple simultaneous calls
    if (status === 'processing') {
      return
    }

    setStatus('processing')
    setProgress(0)
    setError('')

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 1000)

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      const data = await response.json()

      if (data.success) {
        console.log('TranscriptionStatus: Success, calling onTranscriptionComplete')
        console.log('TranscriptionStatus: Transcript length:', data.transcript?.length || 0)
        console.log('TranscriptionStatus: ID:', data.id)
        setStatus('completed')
        onTranscriptionComplete(data.transcript, data.id)
      } else {
        console.log('TranscriptionStatus: Error:', data.error)
        setStatus('error')
        setError(data.error || 'Transcription failed')
        onTranscriptionError(data.error || 'Transcription failed')
      }
    } catch (error) {
      // Only set error if we're still processing (not completed by another call)
      if (status === 'processing') {
        setStatus('error')
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        setError(errorMessage)
        onTranscriptionError(errorMessage)
      }
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return 'Transcribing video... This may take a few minutes.'
      case 'completed':
        return 'Transcription completed successfully!'
      case 'error':
        return 'Transcription failed. Please try again.'
      default:
        return ''
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-blue-600'
      case 'completed':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (status === 'idle') {
    return null
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center space-x-3">
        {status === 'processing' && (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        )}
        {status === 'completed' && (
          <div className="rounded-full h-5 w-5 bg-green-600 flex items-center justify-center">
            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {status === 'error' && (
          <div className="rounded-full h-5 w-5 bg-red-600 flex items-center justify-center">
            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
        
        <div className="flex-1">
          <p className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusMessage()}
          </p>
          
          {status === 'processing' && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}
          
          {error && (
            <p className="text-xs text-red-500 mt-1">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
