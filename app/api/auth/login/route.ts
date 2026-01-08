import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import * as Sentry from "@sentry/nextjs"
import { getClientIP, checkRateLimit, RATE_LIMIT_CONFIG } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()

    // Apply rate limiting
    const ip = getClientIP()
    const rateLimitConfig = RATE_LIMIT_CONFIG.auth
    const rateLimitResult = checkRateLimit(ip, rateLimitConfig)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitConfig.errorMessage },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter),
          },
        }
      )
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch (error) {
              // Ignore cookie errors in API routes
            }
          },
        },
      },
    )

    const { email, password } = await request.json()

    console.log("🔐 Login attempt for:", email)
    console.log("📍 Using Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)

    if (!email || !password) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 })
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    console.log("🔍 Login response:", { success: !error, error: error?.message })

    if (error || !data?.user) {
      // Log to Sentry for monitoring
      Sentry.captureMessage(`Login failed for ${email}: ${error?.message}`, 'warning')
      
      return NextResponse.json(
        { error: error?.message || "تعذر تسجيل الدخول" },
        { status: 401 }
      )
    }

    const role = data.user.user_metadata?.role || "user"

    // Add rate limit info to response headers
    const response = NextResponse.json({
      ok: true,
      role,
      redirectTo: role === "pharmacy" ? "/pharmacy/dashboard" : "/home",
    })

    response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining))
    response.headers.set('X-RateLimit-Limit', String(rateLimitConfig.maxRequests))

    return response
  } catch (err: any) {
    const message = typeof err?.message === "string" ? err.message : "خطأ غير متوقع"
    
    // Log to Sentry
    Sentry.captureException(err, {
      tags: {
        component: 'auth-login',
      },
    })

    console.error("/api/auth/login error", err)
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
