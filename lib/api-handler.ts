// lib/api-handler.ts
import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { getClientIP, checkRateLimit, RATE_LIMIT_CONFIG, createRateLimitResponse } from './rate-limit'

export interface APIOptions {
  rateLimit?: keyof typeof RATE_LIMIT_CONFIG
  requireAuth?: boolean
  logErrors?: boolean
}

/**
 * Wraps API route handlers with error handling, rate limiting, and logging
 * @param handler - The actual API route handler
 * @param options - Configuration options
 */
export function withErrorHandling<T extends (req: NextRequest) => Promise<NextResponse>>(
  handler: T,
  options: APIOptions = {}
) {
  return async (request: NextRequest) => {
    try {
      // Apply rate limiting if configured
      if (options.rateLimit) {
        const ip = getClientIP()
        const config = RATE_LIMIT_CONFIG[options.rateLimit]
        const result = checkRateLimit(ip, config)

        if (!result.allowed) {
          return createRateLimitResponse(result, config)
        }

        // Add rate limit headers to response
        const response = await handler(request)
        response.headers.set('X-RateLimit-Limit', String(config.maxRequests))
        response.headers.set('X-RateLimit-Remaining', String(result.remaining))
        return response
      }

      return await handler(request)
    } catch (error) {
      // Log to Sentry
      Sentry.captureException(error, {
        tags: {
          component: 'api-handler',
          method: request.method,
          path: request.nextUrl.pathname,
        },
        contexts: {
          http: {
            method: request.method,
            url: request.nextUrl.href,
          },
        },
      })

      if (options.logErrors !== false) {
        console.error('[API Error]', {
          path: request.nextUrl.pathname,
          method: request.method,
          error: error instanceof Error ? error.message : String(error),
        })
      }

      // Handle rate limit errors
      if (error instanceof Error && 'code' in error && error.code === 'RATE_LIMIT_EXCEEDED') {
        const retryAfter = (error as any).retryAfter || 60
        return NextResponse.json(
          { error: 'عذراً، عدد الطلبات كثير جداً. حاول مجدداً بعد لحظات.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(retryAfter),
            },
          }
        )
      }

      // Generic error response
      const message =
        error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
      return NextResponse.json(
        { error: message },
        { status: 500 }
      )
    }
  }
}

/**
 * Utility to validate JSON body with error handling
 */
export async function parseJSON<T>(request: NextRequest): Promise<T | null> {
  try {
    return await request.json()
  } catch (error) {
    console.error('Failed to parse JSON:', error)
    throw new Error('بيانات JSON غير صحيحة')
  }
}

/**
 * Utility to validate required fields
 */
export function validateRequired(data: Record<string, any>, fields: string[]) {
  const missing = fields.filter((field) => !data[field])
  if (missing.length > 0) {
    throw new Error(`الحقول المطلوبة ناقصة: ${missing.join(', ')}`)
  }
}
