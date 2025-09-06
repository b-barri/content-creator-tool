'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Progress } from './progress'

interface VideoUploadProps {
  onUploadComplete: (data: {
    fileName: string
    url: string
    size: number
    type: string
  }) => void
  onUploadError: (error: string) => void
}

export default function VideoUpload({ onUploadComplete, onUploadError }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploadedFile(file)
    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 10
        })
      }, 200)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()
      
      console.log('Upload response:', { status: response.status, data })

      if (response.ok && data.success) {
        onUploadComplete(data)
      } else {
        console.error('Upload failed with response:', data)
        const errorMessage = data.details 
          ? `${data.error}: ${data.details}` 
          : data.error || `Upload failed (${response.status})`
        onUploadError(errorMessage)
      }
    } catch (error) {
      console.error('Upload error:', error)
      onUploadError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }, [onUploadComplete, onUploadError])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v']
    },
    maxSize: 25 * 1024 * 1024, // 25MB limit for OpenAI Whisper
    multiple: false,
    disabled: uploading,
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        onUploadError('File is too large. Please use a video smaller than 25MB for transcription.')
      } else {
        onUploadError('File type not supported. Please use MP4, MOV, AVI, MKV, WebM, or M4V.')
      }
    }
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-200
          ${isDragActive && !isDragReject 
            ? 'border-[#C7AFFF] bg-purple-50 scale-[1.02]' 
            : isDragReject 
            ? 'border-red-400 bg-red-50' 
            : 'border-[#D1D5DB] hover:border-[#C7AFFF] hover:bg-purple-50/50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-8">
          <div className="mx-auto w-24 h-24 bg-[#C7AFFF] rounded-2xl flex items-center justify-center shadow-sm">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          
          <div>
            <p className="text-2xl font-light text-[#000000] mb-3">
              {isDragActive
                ? isDragReject
                  ? 'File type not supported'
                  : 'Drop your video here'
                : 'Drag & drop your video here'
              }
            </p>
            <p className="text-[#777777] font-light text-lg mb-4">
              or click to browse files
            </p>
            <p className="text-sm text-[#888888] font-light">
              Supports MP4, MOV, AVI, MKV, WebM, M4V (max 25MB for transcription)
            </p>
          </div>
        </div>
      </div>

      {uploadedFile && (
        <div className="mt-8 p-8 bg-white rounded-2xl border border-[#D1D5DB] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-[#C7AFFF] rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-[#000000]">{uploadedFile.name}</p>
                <p className="text-sm text-[#777777] font-light">{formatFileSize(uploadedFile.size)}</p>
              </div>
            </div>
            {uploading && (
              <div className="text-sm font-medium text-[#C7AFFF]">
                {Math.round(uploadProgress)}%
              </div>
            )}
          </div>
          
          {uploading && (
            <Progress value={uploadProgress} className="w-full" />
          )}
        </div>
      )}
    </div>
  )
}
