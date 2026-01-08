// hooks/use-network-status.ts
'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { getOfflineQueue } from '@/lib/offline-storage'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    // Set initial status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      console.log('🌐 Network connected')
      setIsOnline(true)

      if (wasOffline) {
        toast.success('تم الاتصال بالإنترنت', {
          description: 'جاري مزامنة البيانات...',
        })

        // Process offline queue
        const queue = getOfflineQueue()
        queue.processQueue().then(() => {
          if (queue.size === 0) {
            toast.success('تم مزامنة جميع البيانات')
          }
        }).catch((error) => {
          console.error('Failed to sync offline data:', error)
          toast.error('فشلت مزامنة بعض البيانات')
        })

        setWasOffline(false)
      }
    }

    const handleOffline = () => {
      console.log('📡 Network disconnected')
      setIsOnline(false)
      setWasOffline(true)

      toast.warning('لا يوجد اتصال بالإنترنت', {
        description: 'سيتم حفظ تغييراتك ومزامنتها لاحقاً',
        duration: 5000,
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [wasOffline])

  return { isOnline, isOffline: !isOnline }
}
