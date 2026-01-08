// lib/api-client.ts
/**
 * Client-side API utilities
 * Handles API calls with proper URL resolution
 */

/**
 * Get the base URL for API calls
 * In production, uses NEXT_PUBLIC_APP_URL
 * In development, uses window.location.origin
 */
export function getAPIBaseURL(): string {
  // Server-side
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }

  // Client-side - use current origin
  return window.location.origin
}

/**
 * Construct full API URL
 */
export function getAPIURL(path: string): string {
  // If path already has protocol, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  return `${getAPIBaseURL()}/${cleanPath}`
}

/**
 * Enhanced fetch with proper URL resolution
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = getAPIURL(path)
  return fetch(url, init)
}
