// lib/offline-storage.ts
/**
 * Offline storage utilities for syncing data when network is restored
 */

interface OfflineQueueItem {
  id: string
  type: 'upload' | 'mutation' | 'action'
  url: string
  method: string
  body: any
  timestamp: number
  retries: number
}

const QUEUE_KEY = 'offline-queue'
const MAX_RETRIES = 3

export class OfflineQueue {
  private queue: OfflineQueueItem[] = []

  constructor() {
    this.loadQueue()
  }

  private loadQueue() {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(QUEUE_KEY)
      if (stored) {
        this.queue = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error)
    }
  }

  private saveQueue() {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue))
    } catch (error) {
      console.error('Failed to save offline queue:', error)
    }
  }

  /**
   * Add item to queue
   */
  add(item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retries'>) {
    const queueItem: OfflineQueueItem = {
      ...item,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      retries: 0,
    }

    this.queue.push(queueItem)
    this.saveQueue()

    console.log('📥 Added to offline queue:', queueItem)
  }

  /**
   * Process queue when online
   */
  async processQueue() {
    if (this.queue.length === 0) return

    console.log(`🔄 Processing ${this.queue.length} offline items...`)

    const results = await Promise.allSettled(
      this.queue.map((item) => this.processItem(item))
    )

    // Remove successful items
    const successfulIds = results
      .map((result, index) => ({
        result,
        item: this.queue[index],
      }))
      .filter(({ result }) => result.status === 'fulfilled')
      .map(({ item }) => item.id)

    this.queue = this.queue.filter((item) => !successfulIds.includes(item.id))
    this.saveQueue()

    console.log(`✅ Processed ${successfulIds.length}/${results.length} offline items`)
  }

  private async processItem(item: OfflineQueueItem): Promise<void> {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: item.body ? JSON.stringify(item.body) : undefined,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      console.log(`✅ Synced offline item: ${item.type}`)
    } catch (error) {
      item.retries++

      if (item.retries >= MAX_RETRIES) {
        console.error(`❌ Failed to sync after ${MAX_RETRIES} retries:`, item)
        throw error
      }

      console.warn(`⚠️ Retry ${item.retries}/${MAX_RETRIES} for:`, item)
      throw error
    }
  }

  /**
   * Get queue size
   */
  get size() {
    return this.queue.length
  }

  /**
   * Clear queue
   */
  clear() {
    this.queue = []
    this.saveQueue()
  }
}

// Singleton instance
let queueInstance: OfflineQueue | null = null

export function getOfflineQueue(): OfflineQueue {
  if (!queueInstance) {
    queueInstance = new OfflineQueue()
  }
  return queueInstance
}

/**
 * Hook to sync queue when online
 */
export function setupOfflineSync() {
  if (typeof window === 'undefined') return

  const queue = getOfflineQueue()

  // Process queue when coming online
  window.addEventListener('online', () => {
    console.log('🌐 Network restored, processing offline queue...')
    queue.processQueue()
  })

  // Check if already online and process
  if (navigator.onLine) {
    queue.processQueue()
  }
}
