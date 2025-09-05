'use client'

import { useState } from 'react'

interface TitleGeneratorProps {
  titles: string[]
  onTitleSelect: (title: string) => void
  selectedTitle?: string
  isLoading?: boolean
  sampleTitlesCount?: number
}

export default function TitleGenerator({ 
  titles, 
  onTitleSelect, 
  selectedTitle,
  isLoading = false,
  sampleTitlesCount = 0
}: TitleGeneratorProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopy = async (title: string, index: number) => {
    try {
      await navigator.clipboard.writeText(title)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (error) {
      console.error('Failed to copy title:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generating Titles...</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (titles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Titles</h3>
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No titles generated yet.</p>
          <p className="text-sm mt-1">Add sample titles above or click "Skip & Generate Titles" to create titles from your transcript.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Generated Titles ({titles.length})
        </h3>
        {sampleTitlesCount > 0 && (
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span>Analyzed {sampleTitlesCount} sample title{sampleTitlesCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {titles.map((title, index) => (
          <div
            key={index}
            className={`p-4 border rounded-lg transition-all cursor-pointer ${
              selectedTitle === title
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => onTitleSelect(title)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-gray-900 font-medium mb-1">{title}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{title.length} characters</span>
                  <span>•</span>
                  <span>{title.split(' ').length} words</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopy(title, index)
                  }}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  {copiedIndex === index ? 'Copied!' : 'Copy'}
                </button>
                
                {selectedTitle === title && (
                  <div className="flex items-center text-blue-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-1 text-xs font-medium">Selected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Click on a title to select it for description generation. 
          Titles are optimized for YouTube's algorithm and engagement.
        </p>
      </div>
    </div>
  )
}
