'use client'

import { useEffect } from 'react'
import { setupOfflineSync } from '@/lib/offline-storage'

export function OfflineSyncInit() {
  useEffect(() => {
    setupOfflineSync()
  }, [])

  return null
}
