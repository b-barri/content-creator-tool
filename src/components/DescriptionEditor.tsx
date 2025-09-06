'use client'

import { useState, useEffect } from 'react'

interface DescriptionEditorProps {
  description: string
  onDescriptionChange: (description: string) => void
  onGenerateDescription: (title: string) => Promise<void>
  selectedTitle?: string
  isLoading?: boolean
  sampleDescriptionsCount?: number
}

export default function DescriptionEditor({ 
  description, 
  onDescriptionChange, 
  onGenerateDescription,
  selectedTitle,
  isLoading = false,
  sampleDescriptionsCount = 0
}: DescriptionEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localDescription, setLocalDescription] = useState(description)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    console.log('DescriptionEditor: useEffect triggered')
    console.log('DescriptionEditor: Description updated:', description?.substring(0, 100) + '...')
    console.log('DescriptionEditor: Description is null/undefined:', description === null || description === undefined)
    console.log('DescriptionEditor: Description is empty string:', description === '')
    setLocalDescription(description)
  }, [description])

  const handleSave = () => {
    onDescriptionChange(localDescription)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setLocalDescription(description)
    setIsEditing(false)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(localDescription)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy description:', error)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([localDescription], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `description-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatDescription = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.trim() === '') return <br key={index} />
      return (
        <p key={index} className="mb-2">
          {line}
        </p>
      )
    })
  }

  console.log('DescriptionEditor: Current description state:', !!description, 'Length:', description?.length || 0)
  console.log('DescriptionEditor: isLoading:', isLoading)
  console.log('DescriptionEditor: localDescription:', localDescription?.substring(0, 50) + '...')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-2xl font-bold text-slate-800">Video Description</h3>
          {sampleDescriptionsCount > 0 && (
            <div className="flex items-center space-x-2 text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Analyzed {sampleDescriptionsCount} sample description{sampleDescriptionsCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        <div className="flex space-x-3">
          {selectedTitle && !description && (
            <button
              onClick={() => onGenerateDescription(selectedTitle)}
              disabled={isLoading}
              className="btn-primary disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating...' : 'Generate Description'}
            </button>
          )}
          {description && (
            <>
              <button
                onClick={handleCopy}
                className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors flex items-center space-x-2 font-medium"
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
                className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors flex items-center space-x-2 font-medium"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download</span>
              </button>
            </>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center space-x-3">
            <div className="w-8 h-8 gradient-orange rounded-full animate-spin flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <span className="text-lg font-semibold text-slate-700">Generating compelling description...</span>
          </div>
        </div>
      )}

      {!description && !isLoading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 gradient-orange rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No description generated yet</h3>
          {selectedTitle && (
            <p className="text-slate-600">Select a title above and click "Generate Description" to create one.</p>
          )}
        </div>
      )}

      {description && (
        <div className="space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <textarea
                value={localDescription}
                onChange={(e) => setLocalDescription(e.target.value)}
                className="w-full h-80 px-4 py-3 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-700 font-medium resize-none"
                placeholder="Enter your YouTube description..."
              />
              <div className="flex space-x-3">
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-50 p-6 rounded-2xl max-h-80 overflow-y-auto border border-slate-200">
                <div className="prose prose-slate max-w-none">
                  {formatDescription(localDescription)}
                </div>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary"
              >
                Edit Description
              </button>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-slate-600 pt-4 border-t border-slate-200">
            <span className="font-medium">
              {localDescription.split(/\s+/).length} words, {localDescription.length} characters
            </span>
            <span>
              {localDescription.length > 5000 ? (
                <span className="text-orange-600 font-medium">⚠️ Exceeds YouTube's 5000 character limit</span>
              ) : (
                <span className="text-green-600 font-medium">✓ Within YouTube's 5000 character limit</span>
              )}
            </span>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border border-green-200">
        <p className="text-sm text-green-800 font-medium">
          💡 <strong>Pro Tip:</strong> This description is optimized for YouTube SEO with relevant keywords, 
          timestamps, and call-to-action elements.
        </p>
      </div>
    </div>
  )
}
