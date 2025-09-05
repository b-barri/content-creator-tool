'use client'

import { useState } from 'react'

interface Thumbnail {
  url: string
  prompt: string
  style: string
}

interface ThumbnailGalleryProps {
  thumbnails: Thumbnail[]
  onThumbnailSelect: (thumbnail: Thumbnail) => void
  selectedThumbnail?: Thumbnail
  onGenerateThumbnails: (title: string) => Promise<void>
  selectedTitle?: string
  isLoading?: boolean
}

export default function ThumbnailGallery({ 
  thumbnails, 
  onThumbnailSelect, 
  selectedThumbnail,
  onGenerateThumbnails,
  selectedTitle,
  isLoading = false 
}: ThumbnailGalleryProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopyUrl = async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const handleDownload = (url: string, index: number) => {
    const a = document.createElement('a')
    a.href = url
    a.download = `thumbnail-${index + 1}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generating Thumbnails...</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (thumbnails.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Thumbnails</h3>
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>No thumbnails generated yet.</p>
          {selectedTitle && (
            <div className="mt-4">
              <button
                onClick={() => onGenerateThumbnails(selectedTitle)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Generate Thumbnails
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Generated Thumbnails ({thumbnails.length})
        </h3>
        {selectedTitle && (
          <button
            onClick={() => onGenerateThumbnails(selectedTitle)}
            className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Generate More
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {thumbnails.map((thumbnail, index) => (
          <div
            key={index}
            className={`relative group border rounded-lg overflow-hidden transition-all cursor-pointer ${
              selectedThumbnail?.url === thumbnail.url
                ? 'border-purple-500 ring-2 ring-purple-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onThumbnailSelect(thumbnail)}
          >
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              height: '200px', 
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <img
                src={thumbnail.url}
                alt={`Thumbnail ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  backgroundColor: '#f0f0f0'
                }}
                onLoad={(e) => {
                  console.log(`✅ Thumbnail ${index + 1} loaded successfully:`, thumbnail.url)
                }}
                onError={(e) => {
                  console.error(`❌ Failed to load thumbnail ${index + 1}:`, thumbnail.url)
                  const target = e.target as HTMLImageElement
                  target.src = `https://httpbin.org/image/png` // Working fallback
                }}
              />
              
              {/* Overlay with actions - positioned outside image */}
              <div style={{ 
                position: 'absolute', 
                top: '5px', 
                right: '5px', 
                display: 'flex', 
                gap: '5px',
                opacity: 0,
                transition: 'opacity 0.2s'
              }}
              className="group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopyUrl(thumbnail.url, index)
                  }}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor: 'white',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {copiedIndex === index ? 'Copied!' : 'Copy URL'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownload(thumbnail.url, index)
                  }}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor: 'white',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Download
                </button>
              </div>

              {/* Selection indicator */}
              {selectedThumbnail?.url === thumbnail.url && (
                <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full p-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            <div className="p-3">
              <h4 className="text-sm font-medium text-gray-900 mb-1">{thumbnail.style}</h4>
              <p className="text-xs text-gray-500 line-clamp-2">{thumbnail.prompt}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedThumbnail && (
        <div className="mt-4 p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-800">
            ✅ <strong>Selected:</strong> {selectedThumbnail.style} - {selectedThumbnail.prompt}
          </p>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          🎨 <strong>AI-Generated:</strong> These thumbnails are created using DALLE-3 based on your video content and title. 
          Each style offers a different visual approach for your YouTube video.
        </p>
      </div>
    </div>
  )
}
