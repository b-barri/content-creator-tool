'use client'

import { useState, useEffect } from 'react'
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
  const [sampleDescriptions, setSampleDescriptions] = useState<string[]>([])
  const [error, setError] = useState('')
  const [showTranscription, setShowTranscription] = useState(false)
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false)
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false)

  // Auto-generate titles when transcript becomes available and samples exist
  useEffect(() => {
    if (transcript && sampleTitles.length > 0 && !titles.length) {
      console.log('Frontend: Auto-generating titles with samples after transcript available')
      generateTitles()
    }
  }, [transcript, sampleTitles.length])

  const handleUploadComplete = async (uploadData: any) => {
    setUploadedFile(uploadData)
    setError('')
    setShowTranscription(true)
  }

  const handleTranscriptionComplete = async (transcriptText: string, id: string) => {
    console.log('Frontend: Transcription completed, setting transcript:', transcriptText?.substring(0, 100) + '...')
    console.log('Frontend: Transcript ID:', id)
    setTranscript(transcriptText)
    setTranscriptId(id)
    setShowTranscription(false)
  }

  const generateTitles = async () => {
    console.log('Frontend: generateTitles called, transcript exists:', !!transcript)
    console.log('Frontend: transcript length:', transcript?.length || 0)
    if (!transcript) {
      console.log('Frontend: No transcript available, setting error')
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
      console.log('Frontend: Generating description with samples:', sampleDescriptions)
      console.log('Frontend: Sample descriptions count:', sampleDescriptions.length)

      const response = await fetch('/api/generate-descriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          title,
          transcriptId,
          sampleDescriptions: sampleDescriptions.length > 0 ? sampleDescriptions : undefined
        })
      })

      const data = await response.json()

      console.log('Frontend: API response received:', data)
      console.log('Frontend: data.success:', data.success)
      console.log('Frontend: data.description exists:', !!data.description)
      
      if (data.success) {
        console.log('Frontend: Setting description:', data.description?.substring(0, 100) + '...')
        console.log('Frontend: Description length:', data.description?.length || 0)
        setDescription(data.description)
        console.log('Frontend: Description state should be updated now')
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

  const generateThumbnails = async (title: string, branding?: { 
    channelName: string; 
    channelNiche: string; 
    brandColors: string; 
    hexColors: string[]; 
    referenceImage?: string;
    textOverlay: string;
  }) => {
    setIsGeneratingThumbnails(true)
    try {
      const response = await fetch('/api/generate-thumbnails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          title,
          transcriptId,
          channelName: branding?.channelName,
          channelNiche: branding?.channelNiche,
          brandColors: branding?.brandColors,
          hexColors: branding?.hexColors,
          referenceImage: branding?.referenceImage,
          textOverlay: branding?.textOverlay
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
    console.log('Page: handleDescriptionChange called with:', newDescription?.substring(0, 50) + '...')
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
            onSampleDescriptionsUpdate={setSampleDescriptions}
            onGenerateTitles={generateTitles}
            currentSampleTitles={sampleTitles}
            currentSampleDescriptions={sampleDescriptions}
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
            {console.log('Page: Rendering DescriptionEditor with description:', !!description, 'Length:', description?.length || 0)}
            {console.log('Page: description value:', description)}
            {console.log('Page: description === undefined:', description === undefined)}
            {console.log('Page: description === null:', description === null)}
            {console.log('Page: description === "":', description === '')}
            <DescriptionEditor
              description={description}
              onDescriptionChange={handleDescriptionChange}
              onGenerateDescription={generateDescription}
              selectedTitle={selectedTitle}
              isLoading={isGeneratingDescription}
              sampleDescriptionsCount={sampleDescriptions.length}
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