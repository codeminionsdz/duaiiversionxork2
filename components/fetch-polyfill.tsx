'use client'

import { useEffect } from 'react'

/**
 * Global fetch interceptor for API calls
 * Automatically converts relative /api/* URLs to absolute URLs
 */
export function FetchPolyfill() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const originalFetch = window.fetch

    // Wrap the native fetch so we preserve any Next.js helpers attached to it
    const wrappedFetch: typeof window.fetch = (input, init) => {
      let url: string

      if (typeof input === 'string') {
        url = input
      } else if (input instanceof URL) {
        url = input.href
      } else if (input instanceof Request) {
        url = input.url
      } else {
        url = String(input)
      }

      if (url.startsWith('/api/')) {
        const absoluteUrl = `${window.location.origin}${url}`
        console.log(`🔄 Fetch intercepted: ${url} → ${absoluteUrl}`)

        const newInput = input instanceof Request ? new Request(absoluteUrl, input) : absoluteUrl
        return originalFetch.call(window, newInput as RequestInfo | URL, init)
      }

      return originalFetch.call(window, input, init)
    }

    // Copy original properties (Next.js attaches metadata used at runtime)
    Object.defineProperties(wrappedFetch, Object.getOwnPropertyDescriptors(originalFetch))

    // Override global fetch
    window.fetch = wrappedFetch

    console.log('✅ Fetch polyfill initialized')

    // Cleanup on unmount
    return () => {
      window.fetch = originalFetch
    }
  }, [])

  return null
}
