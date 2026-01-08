"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { FileText } from "lucide-react"
import { getImagePublicUrl } from "@/lib/image-utils"

interface PrescriptionImageThumbClientProps {
  imagePath: string | null
}

export function PrescriptionImageThumbClient({ imagePath }: PrescriptionImageThumbClientProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadImage = async () => {
      try {
        if (!imagePath) {
          setIsLoading(false)
          return
        }

        const url = await getImagePublicUrl(imagePath)
        setImageUrl(url)
      } catch (error) {
        console.error("❌ خطأ في تحميل الصورة:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadImage()
  }, [imagePath])

  return (
    <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-200 shadow-md">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt="وصفة طبية"
          fill
          className="object-cover"
          unoptimized
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <FileText className="h-8 w-8 text-blue-300" />
        </div>
      )}
    </div>
  )
}
