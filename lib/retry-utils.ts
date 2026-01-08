// lib/retry-utils.ts
/**
 * Retry utility for failed API calls
 * Implements exponential backoff and jitter
 */

interface RetryOptions {
  maxAttempts?: number
  initialDelayMs?: number
  maxDelayMs?: number
  shouldRetry?: (error: any) => boolean
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  shouldRetry: (error) => {
    // Retry on network errors and 5xx errors
    if (error instanceof TypeError) return true // Network error
    if (error?.status >= 500) return true
    if (error?.status === 408) return true // Request timeout
    if (error?.status === 429) return true // Rate limit
    return false
  },
}

/**
 * Retries a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
  let lastError: any

  for (let attempt = 1; attempt <= mergedOptions.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Check if we should retry
      if (!mergedOptions.shouldRetry(error) || attempt === mergedOptions.maxAttempts) {
        throw error
      }

      // Calculate delay with exponential backoff + jitter
      const baseDelay = mergedOptions.initialDelayMs * Math.pow(2, attempt - 1)
      const jitter = Math.random() * 0.1 * baseDelay // 10% jitter
      const delayMs = Math.min(baseDelay + jitter, mergedOptions.maxDelayMs)

      console.log(`⏳ Retry attempt ${attempt}/${mergedOptions.maxAttempts} in ${Math.round(delayMs)}ms`, {
        error: error instanceof Error ? error.message : String(error),
      })

      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  throw lastError
}

/**
 * Parse retry-after header
 */
export function getRetryAfter(headers: HeadersInit | Headers): number {
  if (!headers) return 60

  const retryAfter = headers instanceof Headers
    ? headers.get('retry-after')
    : (headers as any)['retry-after']

  if (!retryAfter) return 60

  // Try parsing as seconds
  const seconds = parseInt(retryAfter, 10)
  if (!isNaN(seconds)) return seconds

  // Try parsing as HTTP date
  const date = new Date(retryAfter)
  if (!isNaN(date.getTime())) {
    return Math.max(1, Math.round((date.getTime() - Date.now()) / 1000))
  }

  return 60
}

/**
 * Fetch with retry
 */
export async function fetchWithRetry(
  url: string,
  init?: RequestInit & { retryOptions?: RetryOptions }
): Promise<Response> {
  const { retryOptions, ...fetchInit } = init || {}

  return retryWithBackoff(
    async () => {
      const response = await fetch(url, fetchInit)

      // Throw for error status codes
      if (!response.ok) {
        const error: any = new Error(`HTTP ${response.status}`)
        error.status = response.status
        error.response = response
        throw error
      }

      return response
    },
    retryOptions
  )
}
