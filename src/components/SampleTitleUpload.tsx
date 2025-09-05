'use client'

import { useState, useEffect } from 'react'

interface SampleTitleUploadProps {
  onSampleTitlesUpdate: (titles: string[]) => void
  onGenerateTitles: () => void
  currentSampleTitles?: string[]
  isTranscriptionComplete?: boolean
  isTranscriptionInProgress?: boolean
}

export default function SampleTitleUpload({ 
  onSampleTitlesUpdate, 
  onGenerateTitles,
  currentSampleTitles = [],
  isTranscriptionComplete = false,
  isTranscriptionInProgress = false
}: SampleTitleUploadProps) {
  const [titles, setTitles] = useState<string[]>(currentSampleTitles)
  const [newTitle, setNewTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    onSampleTitlesUpdate(titles)
  }, [titles, onSampleTitlesUpdate])

  const addTitle = () => {
    if (newTitle.trim() && !titles.includes(newTitle.trim())) {
      setTitles([...titles, newTitle.trim()])
      setNewTitle('')
    }
  }

  const removeTitle = (index: number) => {
    setTitles(titles.filter((_, i) => i !== index))
  }

  const saveSampleTitles = async () => {
    if (titles.length === 0) {
      setMessage('Please add at least one sample title')
      return
    }

    if (!isTranscriptionComplete) {
      setMessage('Please wait for transcription to complete before generating titles')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/sample-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titles,
          category: 'general'
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`Successfully saved ${data.count} sample titles!`)
        setShowUpload(false)
        // Trigger title generation after saving samples
        onGenerateTitles()
      } else {
        // If database error, still proceed with title generation
        console.warn('Database save failed, but proceeding with title generation:', data.error)
        setMessage(`Sample titles saved locally (database unavailable). Proceeding with title generation...`)
        setShowUpload(false)
        onGenerateTitles()
      }
    } catch (error) {
      // If API fails completely, still proceed with title generation
      console.warn('API call failed, but proceeding with title generation:', error)
      setMessage(`Sample titles saved locally. Proceeding with title generation...`)
      setShowUpload(false)
      onGenerateTitles()
    } finally {
      setIsLoading(false)
    }
  }

  const loadExistingSamples = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch(`/api/sample-titles?category=general&limit=20`)
      const data = await response.json()

      if (data.success && data.sampleTitles.length > 0) {
        const existingTitles = data.sampleTitles.map((item: any) => item.title)
        setTitles(existingTitles)
        setMessage(`Loaded ${existingTitles.length} existing sample titles`)
        // Only trigger title generation if transcription is complete
        if (isTranscriptionComplete) {
          onGenerateTitles()
        } else {
          setMessage(`Loaded ${existingTitles.length} existing sample titles. Waiting for transcription to complete...`)
        }
      } else {
        setMessage('No existing sample titles found')
      }
    } catch (error) {
      setMessage('Failed to load existing sample titles')
      console.error('Error loading sample titles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sample Titles for Analysis</h3>
          {isTranscriptionInProgress && (
            <p className="text-sm text-blue-600 mt-1">⏳ Transcription in progress...</p>
          )}
          {isTranscriptionComplete && (
            <p className="text-sm text-green-600 mt-1">✅ Transcription complete - ready to generate titles!</p>
          )}
          {!isTranscriptionComplete && !isTranscriptionInProgress && (
            <p className="text-sm text-gray-500 mt-1">📝 Upload a video to get started</p>
          )}
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {showUpload ? 'Hide' : 'Manage Samples'}
        </button>
      </div>

      {titles.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Using {titles.length} sample title{titles.length !== 1 ? 's' : ''} for analysis:
          </p>
          <div className="max-h-32 overflow-y-auto bg-gray-50 p-3 rounded-lg">
            {titles.map((title, index) => (
              <div key={index} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-700 flex-1">{title}</span>
                <button
                  onClick={() => removeTitle(index)}
                  className="ml-2 text-red-600 hover:text-red-800 text-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showUpload && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Sample Title
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter a successful YouTube title..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && addTitle()}
              />
              <button
                onClick={addTitle}
                disabled={!newTitle.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={saveSampleTitles}
              disabled={isLoading || titles.length === 0 || !isTranscriptionComplete}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {isLoading ? 'Saving...' : isTranscriptionComplete ? 'Save & Generate Titles' : 'Waiting for Transcription...'}
            </button>
            <button
              onClick={loadExistingSamples}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
            >
              {isLoading ? 'Loading...' : 'Load Existing'}
            </button>
            <button
              onClick={() => {
                if (!isTranscriptionComplete) {
                  setMessage('Please wait for transcription to complete before generating titles')
                  return
                }
                setShowUpload(false)
                onGenerateTitles()
              }}
              disabled={isLoading || !isTranscriptionComplete}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              {isTranscriptionComplete ? 'Skip & Generate Titles' : 'Waiting for Transcription...'}
            </button>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes('Error') || message.includes('Failed') 
                ? 'bg-red-100 text-red-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>💡 <strong>Tip:</strong> Upload your most successful YouTube titles to help the AI generate similar high-performing titles for your content.</p>
      </div>
    </div>
  )
}
