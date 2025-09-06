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
      <div className="text-center py-12">
        <div className="inline-flex items-center space-x-3">
          <div className="w-8 h-8 gradient-orange rounded-full animate-spin flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <span className="text-lg font-semibold text-slate-700">Generating amazing titles...</span>
        </div>
        <div className="mt-8 space-y-4 max-w-2xl mx-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-5 bg-slate-200 rounded-lg w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (titles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 gradient-orange rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">No titles generated yet</h3>
        <p className="text-slate-600 mb-4">Add sample titles above or click "Skip & Generate Titles" to create titles from your transcript.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-slate-800">
          Generated Titles ({titles.length})
        </h3>
        {sampleTitlesCount > 0 && (
          <div className="flex items-center space-x-2 text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Analyzed {sampleTitlesCount} sample title{sampleTitlesCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
      
      <div className="grid gap-4">
        {titles.map((title, index) => (
          <div
            key={index}
            className={`p-6 border-2 rounded-2xl transition-all cursor-pointer ${
              selectedTitle === title
                ? 'border-orange-400 bg-orange-50 shadow-lg'
                : 'border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 hover:shadow-md'
            }`}
            onClick={() => onTitleSelect(title)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-slate-800 font-semibold text-lg mb-2 leading-relaxed">{title}</p>
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <span className="bg-slate-100 px-2 py-1 rounded-full">{title.length} characters</span>
                  <span className="bg-slate-100 px-2 py-1 rounded-full">{title.split(' ').length} words</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 ml-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopy(title, index)
                  }}
                  className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                >
                  {copiedIndex === index ? 'Copied!' : 'Copy'}
                </button>
                
                {selectedTitle === title && (
                  <div className="flex items-center text-orange-600 bg-orange-100 px-3 py-2 rounded-xl">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-2 text-sm font-semibold">Selected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
        <p className="text-sm text-orange-800 font-medium">
          💡 <strong>Pro Tip:</strong> Click on a title to select it for description generation. 
          These titles are optimized for YouTube's algorithm and maximum engagement.
        </p>
      </div>
    </div>
  )
}
