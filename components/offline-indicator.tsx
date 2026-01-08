'use client'

import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check initial status
    setIsOnline(navigator.onLine)
    setShowBanner(!navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShowBanner(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowBanner(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showBanner) return null

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg animate-in slide-in-from-top duration-300"
      style={{ direction: 'rtl' }}
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <WifiOff className="h-5 w-5 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
            </div>
            <span className="font-semibold text-sm">
              لا يوجد اتصال بالإنترنت
            </span>
          </div>
          <span className="text-xs opacity-90 hidden sm:inline">
            • يمكنك التنقل في التطبيق، لكن بعض الميزات قد لا تعمل
          </span>
        </div>
      </div>
    </div>
  )
}
