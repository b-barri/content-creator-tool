'use client'

import { useState, useEffect } from 'react'

interface DescriptionEditorProps {
  description: string
  onDescriptionChange: (description: string) => void
  onGenerateDescription: (title: string) => Promise<void>
  selectedTitle?: string
  isLoading?: boolean
}

export default function DescriptionEditor({ 
  description, 
  onDescriptionChange, 
  onGenerateDescription,
  selectedTitle,
  isLoading = false 
}: DescriptionEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localDescription, setLocalDescription] = useState(description)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">YouTube Description</h3>
        <div className="flex space-x-2">
          {selectedTitle && !description && (
            <button
              onClick={() => onGenerateDescription(selectedTitle)}
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              {isLoading ? 'Generating...' : 'Generate Description'}
            </button>
          )}
          {description && (
            <>
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
            </>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-blue-800">Generating description...</span>
          </div>
        </div>
      )}

      {!description && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No description generated yet.</p>
          {selectedTitle && (
            <p className="text-sm mt-1">Select a title above and click "Generate Description" to create one.</p>
          )}
        </div>
      )}

      {description && (
        <div className="space-y-4">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={localDescription}
                onChange={(e) => setLocalDescription(e.target.value)}
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your YouTube description..."
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  {formatDescription(localDescription)}
                </div>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Edit Description
              </button>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
            <span>
              {localDescription.split(/\s+/).length} words, {localDescription.length} characters
            </span>
            <span>
              {localDescription.length > 5000 ? (
                <span className="text-yellow-600">⚠️ Exceeds YouTube's 5000 character limit</span>
              ) : (
                <span className="text-green-600">✓ Within YouTube's 5000 character limit</span>
              )}
            </span>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <p className="text-sm text-green-800">
          💡 <strong>Tip:</strong> This description is optimized for YouTube SEO with relevant keywords, 
          timestamps, and call-to-action elements.
        </p>
      </div>
    </div>
  )
}
