"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"

interface PrescriptionImageProps {
  src: string
  alt: string
}

export function PrescriptionImage({ src, alt }: PrescriptionImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadImage = async () => {
      if (!src || src === "/placeholder.svg") {
        setImageUrl(src)
        setIsLoading(false)
        return
      }

      // If API already sent a full URL (signed/public), just use it
      if (src.startsWith("http")) {
        setImageUrl(src)
        setIsLoading(false)
        return
      }

      // Normalize storage path: strip bucket prefix or leading slash
      let filePath = src.replace(/^prescriptions\//, "").replace(/^\//, "")

      const supabase = createClient()
      const { data } = supabase.storage.from('prescriptions').getPublicUrl(filePath)
      
      if (data?.publicUrl) {
        setImageUrl(data.publicUrl)
      } else {
        setImageUrl("/placeholder.svg")
      }
      setIsLoading(false)
    }

    loadImage()
  }, [src])

  if (isLoading) {
    return (
      <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-200 shadow-md animate-pulse" />
    )
  }

  return (
    <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-emerald-100 to-emerald-200 border-2 border-emerald-200 shadow-md cursor-pointer group">
      <Image
        src={imageUrl || "/placeholder.svg"}
        alt={alt}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-200"
        onClick={() => imageUrl && window.open(imageUrl, "_blank")}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 rounded-xl flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
