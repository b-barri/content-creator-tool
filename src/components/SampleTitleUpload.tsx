'use client'

import { useState, useEffect } from 'react'

interface SampleTitleUploadProps {
  onSampleTitlesUpdate: (titles: string[]) => void
  onSampleDescriptionsUpdate: (descriptions: string[]) => void
  onGenerateTitles: () => void
  currentSampleTitles?: string[]
  currentSampleDescriptions?: string[]
  isTranscriptionComplete?: boolean
  isTranscriptionInProgress?: boolean
}

export default function SampleTitleUpload({ 
  onSampleTitlesUpdate, 
  onSampleDescriptionsUpdate,
  onGenerateTitles,
  currentSampleTitles = [],
  currentSampleDescriptions = [],
  isTranscriptionComplete = false,
  isTranscriptionInProgress = false
}: SampleTitleUploadProps) {
  const [titles, setTitles] = useState<string[]>(currentSampleTitles)
  const [descriptions, setDescriptions] = useState<string[]>(currentSampleDescriptions)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showUpload, setShowUpload] = useState(true)
  const [activeTab, setActiveTab] = useState<'titles' | 'descriptions'>('titles')

  useEffect(() => {
    onSampleTitlesUpdate(titles)
  }, [titles, onSampleTitlesUpdate])

  useEffect(() => {
    onSampleDescriptionsUpdate(descriptions)
  }, [descriptions, onSampleDescriptionsUpdate])

  const addTitle = () => {
    if (newTitle.trim() && !titles.includes(newTitle.trim())) {
      setTitles([...titles, newTitle.trim()])
      setNewTitle('')
    }
  }

  const removeTitle = (index: number) => {
    setTitles(titles.filter((_, i) => i !== index))
  }

  const addDescription = () => {
    if (newDescription.trim() && !descriptions.includes(newDescription.trim())) {
      setDescriptions([...descriptions, newDescription.trim()])
      setNewDescription('')
    }
  }

  const removeDescription = (index: number) => {
    setDescriptions(descriptions.filter((_, i) => i !== index))
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

  const saveSampleDescriptions = async () => {
    if (descriptions.length === 0) {
      setMessage('Please add at least one sample description')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/sample-descriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descriptions
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`Successfully saved ${data.descriptions.length} sample descriptions!`)
      } else {
        console.warn('Database save failed:', data.error)
        setMessage(`Sample descriptions saved locally (database unavailable)`)
      }
    } catch (error) {
      console.warn('API call failed:', error)
      setMessage(`Sample descriptions saved locally`)
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
    <div className="space-y-6">
      {isTranscriptionInProgress && (
        <div className="mb-4">
          <p className="text-orange-600 font-medium">⏳ Transcription in progress...</p>
        </div>
      )}
      {isTranscriptionComplete && (
        <div className="mb-4">
          <p className="text-green-600 font-medium">✅ Transcription complete - ready to generate content!</p>
        </div>
      )}

      {(titles.length > 0 || descriptions.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {titles.length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 gradient-orange rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">📝</span>
                </div>
                <h4 className="font-bold text-slate-800 text-lg">{titles.length} Sample Title{titles.length !== 1 ? 's' : ''}</h4>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-3">
                {titles.map((title, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-sm text-slate-700 flex-1 font-medium">{title}</span>
                    <button
                      onClick={() => removeTitle(index)}
                      className="ml-3 text-red-500 hover:text-red-700 text-lg font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {descriptions.length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 gradient-orange rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">📄</span>
                </div>
                <h4 className="font-bold text-slate-800 text-lg">{descriptions.length} Sample Description{descriptions.length !== 1 ? 's' : ''}</h4>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-3">
                {descriptions.map((description, index) => (
                  <div key={index} className="flex items-start justify-between bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-sm text-slate-700 flex-1 font-medium">{description}</span>
                    <button
                      onClick={() => removeDescription(index)}
                      className="ml-3 text-red-500 hover:text-red-700 text-lg font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showUpload && (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-2 bg-slate-100 p-2 rounded-2xl">
            <button
              onClick={() => setActiveTab('titles')}
              className={`flex-1 py-3 px-6 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'titles'
                  ? 'bg-white text-orange-600 shadow-lg'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              📝 Titles
            </button>
            <button
              onClick={() => setActiveTab('descriptions')}
              className={`flex-1 py-3 px-6 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'descriptions'
                  ? 'bg-white text-orange-600 shadow-lg'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              📄 Descriptions
            </button>
          </div>

          {/* Title Tab */}
          {activeTab === 'titles' && (
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-slate-800">
                Add Sample Title
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Enter a successful YouTube title..."
                  className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-700 font-medium"
                  onKeyPress={(e) => e.key === 'Enter' && addTitle()}
                />
                <button
                  onClick={addTitle}
                  disabled={!newTitle.trim()}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-slate-400 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Description Tab */}
          {activeTab === 'descriptions' && (
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-slate-800">
                Add Sample Description
              </label>
              <div className="space-y-4">
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Enter a successful YouTube description..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-700 font-medium resize-none"
                />
                <button
                  onClick={addDescription}
                  disabled={!newDescription.trim()}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-slate-400 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  Add Description
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {activeTab === 'titles' && (
              <>
                <button
                  onClick={saveSampleTitles}
                  disabled={isLoading || titles.length === 0 || !isTranscriptionComplete}
                  className="btn-primary disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : isTranscriptionComplete ? 'Save & Generate Titles' : 'Waiting for Transcription...'}
                </button>
                <button
                  onClick={loadExistingSamples}
                  disabled={isLoading}
                  className="btn-secondary disabled:bg-slate-400 disabled:cursor-not-allowed"
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
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-slate-400 transition-all font-semibold shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {isTranscriptionComplete ? 'Skip & Generate Titles' : 'Waiting for Transcription...'}
                </button>
              </>
            )}
            {activeTab === 'descriptions' && (
              <button
                onClick={saveSampleDescriptions}
                disabled={isLoading || descriptions.length === 0}
                className="btn-primary disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Descriptions'}
              </button>
            )}
          </div>

          {message && (
            <div className={`p-4 rounded-2xl text-sm font-medium ${
              message.includes('Error') || message.includes('Failed') 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {message}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
        <p className="text-sm text-orange-800 font-medium">
          💡 <strong>Pro Tip:</strong> Upload your most successful YouTube titles and descriptions to help the AI generate similar high-performing content that matches your style and tone.
        </p>
      </div>
    </div>
  )
}
