// hooks/use-api-error.ts
'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'
import * as Sentry from '@sentry/nextjs'

export interface APIErrorHandler {
  handleError: (error: unknown, context?: string) => void
  retryable: (error: unknown) => boolean
  getRetryAfter: (error: unknown) => number
}

export function useAPIError(): APIErrorHandler {
  const handleError = useCallback((error: unknown, context?: string) => {
    const message = getErrorMessage(error)
    const code = getErrorCode(error)

    // Log to Sentry
    Sentry.captureException(error, {
      tags: {
        component: 'api-error-handler',
        context,
        errorCode: code,
      },
    })

    // Show user-friendly message
    toast.error(message || 'حدث خطأ غير متوقع', {
      description: code === 'RATE_LIMIT' ? 'يرجى الانتظار قليلاً قبل المحاولة مجدداً' : undefined,
    })

    console.error('[API Error]', { message, code, context, error })
  }, [])

  const retryable = useCallback((error: unknown): boolean => {
    const code = getErrorCode(error)
    const status = getErrorStatus(error)

    // Retryable errors
    return (
      code === 'NETWORK_ERROR' ||
      status === 408 || // Request timeout
      status === 429 || // Rate limit
      (status !== null && status >= 500) // Server error
    )
  }, [])

  const getRetryAfter = useCallback((error: unknown): number => {
    // Check if error has retryAfter
    if (error instanceof Error && 'retryAfter' in error) {
      return (error as any).retryAfter * 1000
    }

    // Default backoff
    return 5000
  }, [])

  return {
    handleError,
    retryable,
    getRetryAfter,
  }
}

// Helper functions
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Try to parse JSON error response
    try {
      const data = JSON.parse(error.message)
      return data.error || data.message || error.message
    } catch {
      // Not JSON
    }

    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message)
  }

  return 'حدث خطأ غير متوقع'
}

export function getErrorCode(error: unknown): string {
  if (error instanceof TypeError) {
    return 'NETWORK_ERROR'
  }

  if (error instanceof Error && 'code' in error) {
    return String((error as any).code)
  }

  if (error && typeof error === 'object' && 'code' in error) {
    return String((error as any).code)
  }

  return 'UNKNOWN_ERROR'
}

export function getErrorStatus(error: unknown): number | null {
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as any).status
  }

  return null
}

export function isRetryableError(error: unknown): boolean {
  const status = getErrorStatus(error)
  if (status) {
    return status === 408 || status === 429 || status >= 500
  }

  const code = getErrorCode(error)
  return code === 'NETWORK_ERROR'
}
