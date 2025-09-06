'use client'

import { useState, useEffect } from 'react'

interface Thumbnail {
  url: string
  prompt: string
  style: string
}

interface BrandingInfo {
  channelName: string
  channelNiche: string
  brandColors: string
  hexColors: string[]
  referenceImage?: string
  textOverlay: string
}

interface ThumbnailGalleryProps {
  thumbnails: Thumbnail[]
  onThumbnailSelect: (thumbnail: Thumbnail) => void
  selectedThumbnail?: Thumbnail
  onGenerateThumbnails: (title: string, branding?: BrandingInfo) => Promise<void>
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
  const [showBrandingForm, setShowBrandingForm] = useState(false)
  const [branding, setBranding] = useState<BrandingInfo>({
    channelName: '',
    channelNiche: '',
    brandColors: '',
    hexColors: [],
    referenceImage: undefined,
    textOverlay: ''
  })

  // Load saved branding preferences on component mount
  useEffect(() => {
    try {
      const savedBranding = localStorage.getItem('thumbnailBranding')
      if (savedBranding) {
        const parsed = JSON.parse(savedBranding)
        setBranding(parsed)
      }
    } catch (error) {
      console.error('Failed to load saved branding preferences:', error)
    }
  }, [])

  // Save branding preferences when they change
  const saveBrandingPreferences = (newBranding: BrandingInfo) => {
    try {
      if (newBranding.channelName || newBranding.channelNiche || newBranding.brandColors || newBranding.hexColors.length > 0 || newBranding.textOverlay) {
        localStorage.setItem('thumbnailBranding', JSON.stringify(newBranding))
      }
    } catch (error) {
      console.error('Failed to save branding preferences:', error)
    }
  }

  // Handle reference image upload
  const handleReferenceImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setBranding(prev => ({ ...prev, referenceImage: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Add hex color
  const addHexColor = (color: string) => {
    if (color && !branding.hexColors.includes(color)) {
      setBranding(prev => ({
        ...prev,
        hexColors: [...prev.hexColors, color]
      }))
    }
  }

  // Remove hex color
  const removeHexColor = (color: string) => {
    setBranding(prev => ({
      ...prev,
      hexColors: prev.hexColors.filter(c => c !== color)
    }))
  }

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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎨 AI Thumbnail Generator</h3>
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 mb-4">Ready to create professional YouTube thumbnails!</p>
          
          {/* Status indicator */}
          <div className="mb-6 text-left max-w-sm mx-auto">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <span className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0 mr-3"></span>
                <span className="text-green-700">Video transcript available</span>
              </div>
              <div className="flex items-center text-sm">
                <span className={`w-4 h-4 rounded-full flex-shrink-0 mr-3 ${selectedTitle ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className={selectedTitle ? 'text-green-700' : 'text-gray-500'}>
                  Title selected: {selectedTitle ? `"${selectedTitle.length > 30 ? selectedTitle.substring(0, 30) + '...' : selectedTitle}"` : 'None selected'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                
                if (!selectedTitle) {
                  return
                }
                
                setShowBrandingForm(true)
              }}
              disabled={!selectedTitle}
              style={{
                pointerEvents: selectedTitle ? 'auto' : 'none',
                position: 'relative',
                zIndex: 10
              }}
              className={`px-6 py-3 rounded-lg transition-colors font-medium ${
                selectedTitle 
                  ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {selectedTitle ? '🎨 Generate Thumbnails' : '⚠️ Select a title first'}
            </button>
            
            {selectedTitle && (
              <button
                onClick={() => {
                  onGenerateThumbnails(selectedTitle, undefined)
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm border border-gray-300"
              >
                ⚡ Quick Generate (No Branding)
              </button>
            )}
            {!selectedTitle && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>📝 Next Step:</strong> Go to the "Title Generator" section above and select a title for your video.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Branding Form Modal */}
        {showBrandingForm && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            style={{
              zIndex: 9999,
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}
          >
            <div 
              className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '24px',
                maxWidth: '32rem',
                width: '100%',
                margin: '0 16px',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🎨 Customize Your Thumbnails
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Add your channel branding to create more professional, on-brand thumbnails. All fields are optional.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Channel Name <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={branding.channelName}
                    onChange={(e) => setBranding({...branding, channelName: e.target.value})}
                    placeholder="e.g., TechGuru, CreativeStudio, LearnWithMe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    🏷️ Your channel name for personalized thumbnails
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Channel Niche <span className="text-gray-400">(optional)</span>
                  </label>
                  <select
                    value={branding.channelNiche}
                    onChange={(e) => setBranding({...branding, channelNiche: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select a niche...</option>
                    <option value="tech">Tech & Programming</option>
                    <option value="gaming">Gaming</option>
                    <option value="education">Education & Learning</option>
                    <option value="lifestyle">Lifestyle & Vlogs</option>
                    <option value="business">Business & Finance</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="health">Health & Fitness</option>
                    <option value="travel">Travel</option>
                    <option value="food">Food & Cooking</option>
                    <option value="music">Music</option>
                    <option value="art">Art & Design</option>
                    <option value="sports">Sports</option>
                    <option value="news">News & Politics</option>
                    <option value="other">Other</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    🎯 Helps generate thumbnails that fit your content category
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Colors <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={branding.brandColors}
                    onChange={(e) => setBranding({...branding, brandColors: e.target.value})}
                    placeholder="e.g., blue and white, red and black, purple"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    🎨 Describe your main brand colors to make thumbnails match your style
                  </p>
                </div>

                {/* Text Overlay Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Text Overlay <span className="text-gray-400">(optional)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={branding.textOverlay}
                      onChange={(e) => setBranding({...branding, textOverlay: e.target.value})}
                      placeholder="Enter custom text or leave blank for auto-generation"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedTitle) {
                          // Auto-generate text overlay from title
                          const words = selectedTitle.replace(/^\d+\.\s*/, '').split(' ')
                          const shortText = words.slice(0, 3).join(' ').toUpperCase()
                          setBranding({...branding, textOverlay: shortText})
                        }
                      }}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                      title="Auto-generate from title"
                    >
                      ✨ Auto
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    💬 Text that will appear on the thumbnail (keep it short and punchy!)
                  </p>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <button
                  onClick={() => {
                    const brandingToUse = (branding.channelName || branding.channelNiche || branding.brandColors || branding.hexColors.length > 0 || branding.referenceImage || branding.textOverlay) ? branding : undefined
                    if (brandingToUse) {
                      saveBrandingPreferences(brandingToUse)
                    }
                    onGenerateThumbnails(selectedTitle!, brandingToUse)
                    setShowBrandingForm(false)
                  }}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
                >
                  🎨 Generate Custom Thumbnails
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onGenerateThumbnails(selectedTitle!, undefined)
                      setShowBrandingForm(false)
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Skip & Generate Basic
                  </button>
                  <button
                    onClick={() => setShowBrandingForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
            onClick={() => setShowBrandingForm(true)}
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
          🎨 <strong>Professional AI-Generated Thumbnails:</strong> Created using advanced DALLE-3 AI with your custom branding, optimized text overlays, and YouTube-ready formatting. Each style offers a unique visual approach perfectly tailored to your content.
        </p>
      </div>

      {/* Branding Form Modal */}
      {showBrandingForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          style={{
            zIndex: 9999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '32rem',
              width: '100%',
              margin: '0 16px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🎨 Customize Your Thumbnails
            </h3>
            {/* Modal Debug Info */}
            <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded text-xs">
              ✅ <strong>MODAL IS WORKING!</strong> You should see this if the modal rendered correctly.
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Add your channel branding to create more professional, on-brand thumbnails. All fields are optional.
            </p>
            
            {(branding.channelName || branding.channelNiche || branding.brandColors || branding.hexColors.length > 0 || branding.referenceImage || branding.textOverlay) && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ <strong>Saved branding loaded!</strong> Your preferences have been restored.
                </p>
              </div>
            )}
            
            {/* Preview section */}
            <div className="mb-6 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">📋 What you'll get:</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Thumbnails styled for your channel aesthetic</li>
                <li>• Text overlays optimized for your brand colors</li>
                <li>• Professional, YouTube-ready designs</li>
                <li>• High contrast for better visibility</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Channel Name <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={branding.channelName}
                  onChange={(e) => setBranding({...branding, channelName: e.target.value})}
                  placeholder="e.g., TechReview Pro, CodeMaster, FitLife"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your channel name will influence the thumbnail style
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Channel Niche <span className="text-gray-400">(optional)</span>
                </label>
                <select
                  value={branding.channelNiche}
                  onChange={(e) => setBranding({...branding, channelNiche: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a niche...</option>
                  <option value="tech">🔧 Technology</option>
                  <option value="gaming">🎮 Gaming</option>
                  <option value="lifestyle">✨ Lifestyle</option>
                  <option value="education">📚 Education</option>
                  <option value="entertainment">🎬 Entertainment</option>
                  <option value="business">💼 Business</option>
                  <option value="fitness">💪 Fitness</option>
                  <option value="food">🍽️ Food & Cooking</option>
                  <option value="travel">✈️ Travel</option>
                  <option value="music">🎵 Music</option>
                  <option value="diy">🔨 DIY & Crafts</option>
                  <option value="other">📌 Other</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Helps generate thumbnails that fit your content category
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand Colors <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={branding.brandColors}
                  onChange={(e) => setBranding({...branding, brandColors: e.target.value})}
                  placeholder="e.g., blue and white, red and black, purple"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  🎨 Describe your main brand colors to make thumbnails match your style
                </p>
              </div>

              {/* Hex Color Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hex Colors <span className="text-gray-400">(optional)</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="color"
                    onChange={(e) => addHexColor(e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    title="Pick a color"
                  />
                  <input
                    type="text"
                    placeholder="#FF5733"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement
                        addHexColor(input.value)
                        input.value = ''
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {branding.hexColors.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {branding.hexColors.map((color, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs"
                      >
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: color }}
                        ></div>
                        <span>{color}</span>
                        <button
                          type="button"
                          onClick={() => removeHexColor(color)}
                          className="text-red-500 hover:text-red-700 ml-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  🎯 Add specific hex colors for precise brand matching
                </p>
              </div>

              {/* Text Overlay Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Overlay <span className="text-gray-400">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={branding.textOverlay}
                    onChange={(e) => setBranding({...branding, textOverlay: e.target.value})}
                    placeholder="Enter custom text or leave blank for auto-generation"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedTitle) {
                        // Auto-generate text overlay from title
                        const words = selectedTitle.replace(/^\d+\.\s*/, '').split(' ')
                        const shortText = words.slice(0, 3).join(' ').toUpperCase()
                        setBranding({...branding, textOverlay: shortText})
                      }
                    }}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                    title="Auto-generate from title"
                  >
                    ✨ Auto
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  💬 Text that will appear on the thumbnail (keep it short and punchy!)
                </p>
              </div>

              {/* Reference Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Thumbnail <span className="text-gray-400">(optional)</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReferenceImageUpload}
                    className="hidden"
                    id="reference-upload"
                  />
                  <label
                    htmlFor="reference-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {branding.referenceImage ? (
                      <div className="relative">
                        <img
                          src={branding.referenceImage}
                          alt="Reference"
                          className="max-w-full max-h-24 rounded"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            setBranding(prev => ({ ...prev, referenceImage: undefined }))
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-600">Click to upload reference</span>
                      </>
                    )}
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  📸 Upload a reference thumbnail for style inspiration
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <button
                onClick={() => {
                  const brandingToUse = (branding.channelName || branding.channelNiche || branding.brandColors || branding.hexColors.length > 0 || branding.referenceImage || branding.textOverlay) ? branding : undefined
                  if (brandingToUse) {
                    saveBrandingPreferences(brandingToUse)
                  }
                  onGenerateThumbnails(selectedTitle!, brandingToUse)
                  setShowBrandingForm(false)
                }}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
              >
                🎨 Generate Custom Thumbnails
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onGenerateThumbnails(selectedTitle!, undefined)
                    setShowBrandingForm(false)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Skip & Generate Basic
                </button>
                <button
                  onClick={() => {
                    setBranding({ 
                      channelName: '', 
                      channelNiche: '', 
                      brandColors: '', 
                      hexColors: [], 
                      referenceImage: undefined,
                      textOverlay: ''
                    })
                    localStorage.removeItem('thumbnailBranding')
                  }}
                  className="px-3 py-2 text-xs bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                  title="Clear saved branding"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowBrandingForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
