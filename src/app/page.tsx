'use client'

import { useState } from 'react'
import VideoUpload from '@/components/VideoUpload'
import TranscriptionStatus from '@/components/TranscriptionStatus'
import TranscriptDisplay from '@/components/TranscriptDisplay'
import SampleTitleUpload from '@/components/SampleTitleUpload'
import TitleGenerator from '@/components/TitleGenerator'
import DescriptionEditor from '@/components/DescriptionEditor'
import ThumbnailGallery from '@/components/ThumbnailGallery'

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<any>(null)
  const [transcript, setTranscript] = useState('')
  const [transcriptId, setTranscriptId] = useState('')
  const [titles, setTitles] = useState<string[]>([])
  const [selectedTitle, setSelectedTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [thumbnails, setThumbnails] = useState<any[]>([])
  const [selectedThumbnail, setSelectedThumbnail] = useState<any>(null)
  const [sampleTitles, setSampleTitles] = useState<string[]>([])
  const [error, setError] = useState('')
  const [showTranscription, setShowTranscription] = useState(false)
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false)
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false)

  const handleUploadComplete = async (uploadData: any) => {
    setUploadedFile(uploadData)
    setError('')
    setShowTranscription(true)
  }

  const handleTranscriptionComplete = async (transcriptText: string, id: string) => {
    setTranscript(transcriptText)
    setTranscriptId(id)
    setShowTranscription(false)

    // Auto-generate titles if user already has samples loaded
    if (sampleTitles.length > 0) {
      await generateTitles()
    }
  }

  const generateTitles = async () => {
    if (!transcript) {
      setError('No transcript available for title generation')
      return
    }

    console.log('Frontend: Generating titles with samples:', sampleTitles)
    console.log('Frontend: Sample titles count:', sampleTitles.length)

    setIsGeneratingTitles(true)
    try {
      const requestBody = { 
        transcript: transcript,
        sampleTitles: sampleTitles.length > 0 ? sampleTitles : [
          "10 SECRETS That Will Change Your Life Forever!",
          "I Tried This for 30 Days and Here's What Happened",
          "The Truth About [Topic] That Nobody Talks About"
        ],
        transcriptId
      }
      
      console.log('Frontend: Sending request body:', requestBody)

      const titlesResponse = await fetch('/api/generate-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      const titlesData = await titlesResponse.json()

      if (titlesData.success) {
        setTitles(titlesData.titles)
      } else {
        console.error('Title generation failed:', titlesData.error)
        setError('Failed to generate titles: ' + titlesData.error)
      }
    } catch (error) {
      console.error('Error generating titles:', error)
      setError('Error generating titles')
    } finally {
      setIsGeneratingTitles(false)
    }
  }

  const generateDescription = async (title: string) => {
    setIsGeneratingDescription(true)
    try {
      const response = await fetch('/api/generate-descriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          title,
          transcriptId
        })
      })

      const data = await response.json()

      if (data.success) {
        setDescription(data.description)
      } else {
        console.error('Description generation failed:', data.error)
        setError('Failed to generate description: ' + data.error)
      }
    } catch (error) {
      console.error('Error generating description:', error)
      setError('Error generating description')
    } finally {
      setIsGeneratingDescription(false)
    }
  }

  const generateThumbnails = async (title: string) => {
    setIsGeneratingThumbnails(true)
    try {
      const response = await fetch('/api/generate-thumbnails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          title,
          transcriptId
        })
      })

      const data = await response.json()

      if (data.success) {
        setThumbnails(data.thumbnails)
      } else {
        console.error('Thumbnail generation failed:', data.error)
        setError('Failed to generate thumbnails: ' + data.error)
      }
    } catch (error) {
      console.error('Error generating thumbnails:', error)
      setError('Error generating thumbnails')
    } finally {
      setIsGeneratingThumbnails(false)
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

  const handleSampleTitlesUpdate = (titles: string[]) => {
    setSampleTitles(titles)
  }

  const handleTitleSelect = (title: string) => {
    setSelectedTitle(title)
  }

  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription)
  }

  const handleThumbnailSelect = (thumbnail: any) => {
    setSelectedThumbnail(thumbnail)
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

        {/* Sample Title Upload Section */}
        <div className="mb-8">
          <SampleTitleUpload 
            onSampleTitlesUpdate={handleSampleTitlesUpdate}
            onGenerateTitles={generateTitles}
            currentSampleTitles={sampleTitles}
            isTranscriptionComplete={!!transcript}
            isTranscriptionInProgress={showTranscription}
          />
        </div>

        {/* Title Generation Section */}
        {transcript && (
          <div className="mb-8">
            <TitleGenerator
              titles={titles}
              onTitleSelect={handleTitleSelect}
              selectedTitle={selectedTitle}
              isLoading={isGeneratingTitles}
              sampleTitlesCount={sampleTitles.length}
            />
          </div>
        )}

        {/* Description Generation Section */}
        {transcript && (
          <div className="mb-8">
            <DescriptionEditor
              description={description}
              onDescriptionChange={handleDescriptionChange}
              onGenerateDescription={generateDescription}
              selectedTitle={selectedTitle}
              isLoading={isGeneratingDescription}
            />
          </div>
        )}

        {/* Thumbnail Generation Section */}
        {transcript && (
          <div className="mb-8">
            <ThumbnailGallery
              thumbnails={thumbnails}
              onThumbnailSelect={handleThumbnailSelect}
              selectedThumbnail={selectedThumbnail}
              onGenerateThumbnails={generateThumbnails}
              selectedTitle={selectedTitle}
              isLoading={isGeneratingThumbnails}
            />
          </div>
        )}
      </div>
    </main>
  )
}