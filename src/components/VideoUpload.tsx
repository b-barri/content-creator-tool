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

      if (data.success) {
        onUploadComplete(data)
      } else {
        const errorMessage = data.details 
          ? `${data.error}: ${data.details}` 
          : data.error || 'Upload failed'
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
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive && !isDragReject 
            ? 'border-blue-500 bg-blue-50' 
            : isDragReject 
            ? 'border-red-500 bg-red-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive
                ? isDragReject
                  ? 'File type not supported'
                  : 'Drop your video here'
                : 'Drag & drop your video here'
              }
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to browse files
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Supports MP4, MOV, AVI, MKV, WebM, M4V (max 25MB for transcription)
            </p>
          </div>
        </div>
      </div>

      {uploadedFile && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(uploadedFile.size)}</p>
              </div>
            </div>
            {uploading && (
              <div className="text-sm text-blue-600 font-medium">
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
