'use client'

import Image from 'next/image'
import { useState } from 'react'
import { createClientComponentClient } from '@supabase/supabase-js'

interface ImageViewerProps {
  bucketName: string
  filePath: string
  alt?: string
  width?: number
  height?: number
  className?: string
}

export function ImageViewer({
  bucketName,
  filePath,
  alt = 'صورة',
  width = 400,
  height = 300,
  className = '',
}: ImageViewerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const supabase = createClientComponentClient()

  // Get public URL for the image
  const getImageUrl = () => {
    try {
      const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath)
      return data.publicUrl
    } catch (err) {
      console.error('Error getting image URL:', err)
      setError(true)
      return null
    }
  }

  const url = imageUrl || getImageUrl()

  if (error || !url) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm">لا يمكن عرض الصورة</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image
        src={url}
        alt={alt}
        fill
        className="object-cover rounded-lg"
        onError={() => setError(true)}
      />
    </div>
  )
}

interface PrescriptionImageProps {
  imageUrl: string
  alt?: string
  className?: string
}

export function PrescriptionImage({ imageUrl, alt = 'صورة الوصفة', className = '' }: PrescriptionImageProps) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm">لا يمكن عرض الصورة</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative w-full h-64 ${className}`}>
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className="object-contain rounded-lg"
        onError={() => setError(true)}
      />
    </div>
  )
}
