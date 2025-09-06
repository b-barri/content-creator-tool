'use client'

import { useState, useEffect } from 'react'
import VideoUpload from '@/components/VideoUpload'
import TranscriptionStatus from '@/components/TranscriptionStatus'
import TranscriptDisplay from '@/components/TranscriptDisplay'
import SampleTitleUpload from '@/components/SampleTitleUpload'
import TitleGenerator from '@/components/TitleGenerator'
import DescriptionEditor from '@/components/DescriptionEditor'
import ThumbnailGallery from '@/components/ThumbnailGallery'
import CurvedText from '@/components/CurvedText'

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
    <main className="min-h-screen bg-[#FFFFEE]">
      {/* Header Navigation Bar */}
      <div className="bg-[#1F4D42] text-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-[#1F4D42] font-bold text-lg">⚡</span>
              </div>
              <span className="text-xl font-medium">ContentFlow</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20">
          {/* Main Headline */}
          <div className="text-center mb-16">
            <h1 className="serif-heading text-6xl md:text-8xl font-light mb-8 leading-[1.1] tracking-tight">
              <span className="text-[#888888]">Don't stress,</span> <span className="font-normal text-black">just upload</span>
            </h1>
            
            {/* Sub headline */}
            <div className="max-w-4xl mx-auto mb-4">
              <h2 className="text-2xl md:text-3xl font-medium text-[#000000] mb-4 leading-relaxed font-sans">
                Upload once, get everything for YouTube:
              </h2>
              <p className="text-xl font-normal text-[#777777] leading-relaxed mb-8 font-sans">
                Smart AI handles titles, descriptions, thumbnails, and transcripts.
              </p>
              
            </div>
          </div>

          {/* Curved Text - Full Screen Width */}
          <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
            <CurvedText />
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* Upload Section */}
        <div className="modern-card p-10 mb-16">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-light text-[#000000] mb-4">Start Your Journey</h2>
            <p className="text-xl font-light text-[#777777]">Upload your video and let our AI work its magic</p>
          </div>
          
          <VideoUpload 
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />
          
          {error && (
            <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-red-600 font-medium">{error}</p>
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
          <div className="modern-card p-10 mb-16">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-light text-[#000000] mb-4">Video Transcript</h3>
              <p className="text-lg font-light text-[#777777]">Your video has been transcribed and is ready for optimization</p>
            </div>
            <TranscriptDisplay 
              transcript={transcript}
              videoUrl={uploadedFile?.url}
            />
          </div>
        )}

        {/* Sample Title Upload Section */}
        <div className="modern-card p-10 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-light text-[#000000] mb-4">Personalize as per your Brand language</h3>
            <p className="text-lg font-light text-[#777777]">Help our AI understand your style with sample titles and descriptions</p>
          </div>
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
          <div className="modern-card p-10 mb-16">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-light text-[#000000] mb-4">AI-Generated Titles</h3>
              <p className="text-lg font-light text-[#777777]">Choose from titles optimized for maximum engagement</p>
            </div>
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
          <div className="modern-card p-10 mb-16">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-light text-[#000000] mb-4">Video Description</h3>
              <p className="text-lg font-light text-[#777777]">Generate compelling descriptions that drive engagement</p>
            </div>
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
          <div className="modern-card p-10 mb-16">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-light text-[#000000] mb-4">Thumbnail Gallery</h3>
              <p className="text-lg font-light text-[#777777]">Eye-catching thumbnails designed to maximize click-through rates</p>
            </div>
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