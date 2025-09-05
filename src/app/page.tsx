'use client'

import { useState } from 'react'
import VideoUpload from '@/components/VideoUpload'
import TranscriptionStatus from '@/components/TranscriptionStatus'
import TranscriptDisplay from '@/components/TranscriptDisplay'

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<any>(null)
  const [transcript, setTranscript] = useState('')
  const [transcriptId, setTranscriptId] = useState('')
  const [titles, setTitles] = useState<any[]>([])
  const [error, setError] = useState('')
  const [showTranscription, setShowTranscription] = useState(false)

  const handleUploadComplete = async (uploadData: any) => {
    setUploadedFile(uploadData)
    setError('')
    setShowTranscription(true)
  }

  const handleTranscriptionComplete = async (transcriptText: string, id: string) => {
    setTranscript(transcriptText)
    setTranscriptId(id)
    setShowTranscription(false)

    try {
      // Generate titles after transcription is complete
      const titlesResponse = await fetch('/api/generate-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transcript: transcriptText,
          sampleTitles: [
            "10 SECRETS That Will Change Your Life Forever!",
            "I Tried This for 30 Days and Here's What Happened",
            "The Truth About [Topic] That Nobody Talks About"
          ]
        }),
      })

      const titlesData = await titlesResponse.json()

      if (titlesData.success) {
        setTitles(titlesData.titles)
      } else {
        console.error('Title generation failed:', titlesData.error)
      }
    } catch (error) {
      console.error('Error generating titles:', error)
    }
  }

  const handleTranscriptionError = (errorMessage: string) => {
    setError(errorMessage)
    setShowTranscription(false)
  }

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage)
    setShowTranscription(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
          Content Creator Tool
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Upload Video</h2>
          <VideoUpload 
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          {showTranscription && uploadedFile && (
            <TranscriptionStatus
              videoUrl={uploadedFile.url}
              onTranscriptionComplete={handleTranscriptionComplete}
              onTranscriptionError={handleTranscriptionError}
            />
          )}
        </div>

        {transcript && (
          <div className="mb-8">
            <TranscriptDisplay 
              transcript={transcript}
              videoUrl={uploadedFile?.url}
            />
          </div>
        )}

        {titles.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Generated Titles & Descriptions</h2>
            <div className="space-y-6">
              {titles.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}