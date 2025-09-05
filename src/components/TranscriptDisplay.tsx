'use client'

import { useState } from 'react'

interface TranscriptDisplayProps {
  transcript: string
  videoUrl?: string
}

export default function TranscriptDisplay({ transcript, videoUrl }: TranscriptDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcript)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy transcript:', error)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([transcript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcript-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatTranscript = (text: string) => {
    // Add basic formatting - you can enhance this further
    return text
      .split('\n')
      .map((line, index) => {
        if (line.trim() === '') return null
        return (
          <p key={index} className="mb-2 leading-relaxed">
            {line.trim()}
          </p>
        )
      })
      .filter(Boolean)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Transcript</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-1"
          >
            {copied ? (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center space-x-1"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download</span>
          </button>
        </div>
      </div>

      {videoUrl && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Source:</span> {videoUrl}
          </p>
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
        <div className="prose prose-sm max-w-none">
          {formatTranscript(transcript)}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>
          {transcript.split(/\s+/).length} words, {transcript.length} characters
        </span>
        <span>
          Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  )
}
