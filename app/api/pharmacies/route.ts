import { createClient } from "@/lib/supabase/server"
import { fetchDrivingDistance, calculateHaversineDistance } from "@/lib/utils"
import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit, RATE_LIMIT_CONFIG } from "@/lib/rate-limit"
import * as Sentry from "@sentry/nextjs"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = checkRateLimit(clientIP, RATE_LIMIT_CONFIG.search)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: "Too many requests",
          message: RATE_LIMIT_CONFIG.search.errorMessage,
          retryAfter: rateLimitResult.retryAfter
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_CONFIG.search.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'Retry-After': rateLimitResult.retryAfter.toString(),
          }
        }
      )
    }

    const { userLatitude, userLongitude } = await request.json()

    if (typeof userLatitude !== "number" || typeof userLongitude !== "number") {
      return NextResponse.json(
        { error: "Invalid coordinates" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current user (for authentication)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log(`\n🔷 [API] fetchPharmaciesWithLocation START`)
    console.log(`📍 User Location: (${userLatitude}, ${userLongitude})`)

    // Get all verified pharmacies
    const { data: pharmacies, error } = await supabase
      .from("pharmacy_profiles")
      .select(`
        id,
        pharmacy_name,
        latitude,
        longitude,
        address,
        is_verified
      `)
      .eq("is_verified", true)
      .not("latitude", "is", null)
      .not("longitude", "is", null)

    console.log(`\n📊 [Query Result] ${pharmacies?.length || 0} verified pharmacies found`)

    if (error) {
      console.error("[API] Error fetching pharmacies:", error)
      Sentry.captureException(error, {
        tags: { api: 'pharmacies', action: 'fetch' },
        extra: { userLocation: { userLatitude, userLongitude } }
      })
      return NextResponse.json(
        { error: "Failed to fetch pharmacies" },
        { status: 500 }
      )
    }

    if (!pharmacies || pharmacies.length === 0) {
      console.log(`[API] No verified pharmacies found`)
      return NextResponse.json([])
    }

    // Filter pharmacies that have active subscriptions
    const pharmaciesWithActiveSubscriptions = []

    for (const pharmacy of pharmacies) {
      const { data: subscriptions, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("pharmacy_id", pharmacy.id)
        .eq("status", "active")

      if (subError) {
        console.error(`Subscription query error for pharmacy ${pharmacy.id}:`, subError)
        continue
      }

      if (subscriptions && subscriptions.length > 0) {
        // Check if any subscription is still valid
        const hasValidSubscription = subscriptions.some(sub => {
          const endDate = new Date(sub.expires_at)
          const now = new Date()
          return endDate > now
        })

        if (hasValidSubscription) {
          pharmaciesWithActiveSubscriptions.push(pharmacy)
        }
      }
    }

    console.log(`\n🔍 [Processing] Starting distance calculation for ${pharmaciesWithActiveSubscriptions.length} pharmacies`)

    // Calculate distances for all pharmacies (with improved OSRM driving distance, fallback to Haversine)
    const pharmaciesWithDistancePromises = pharmaciesWithActiveSubscriptions.map(async (pharmacy: any) => {
      let distance: number = 0

      console.log(`\n  📱 Processing: ${pharmacy.pharmacy_name}`)

      // Validate coordinates first
      if (!isFinite(pharmacy.latitude) || !isFinite(pharmacy.longitude)) {
        console.warn(`    ❌ Invalid coordinates: (${pharmacy.latitude}, ${pharmacy.longitude})`)
        distance = 0
      } else {
        console.log(`    ✅ Coordinates valid: (${pharmacy.latitude}, ${pharmacy.longitude})`)

        // Try to get driving distance from OSRM with improved accuracy
        const drivingDistance = await fetchDrivingDistance(
          [userLatitude, userLongitude],
          [pharmacy.latitude, pharmacy.longitude]
        )

        if (drivingDistance !== null && drivingDistance > 0 && isFinite(drivingDistance)) {
          distance = drivingDistance
          console.log(`    ✅ OSRM Result: ${distance.toFixed(2)} km`)
        } else {
          // Fallback to Haversine distance with better precision
          console.log(`    ⚠️ OSRM failed, using Haversine...`)
          const haversineDistance = calculateHaversineDistance(
            userLatitude,
            userLongitude,
            pharmacy.latitude,
            pharmacy.longitude
          )

          if (isFinite(haversineDistance) && haversineDistance > 0) {
            // Apply a correction factor for road distance estimation (typically 1.1-1.3x straight line)
            // This gives a more realistic estimate when routing fails
            distance = haversineDistance * 1.2
            console.log(`    ✅ Haversine Result: ${haversineDistance.toFixed(2)} km × 1.2 = ${distance.toFixed(2)} km`)
          } else {
            distance = 0
            console.warn(`    ❌ Haversine failed: ${haversineDistance}`)
          }
        }
      }

      // Ensure distance is a valid number
      const finalDistance = isFinite(distance) && distance >= 0 ? Number(distance.toFixed(2)) : 0

      return {
        id: pharmacy.id,
        name: pharmacy.pharmacy_name,
        latitude: pharmacy.latitude,
        longitude: pharmacy.longitude,
        address: pharmacy.address,
        rating: 4.5,
        status: "مفتوح" as "مفتوح" | "مغلق",
        is_verified: pharmacy.is_verified,
        distance: finalDistance,
      }
    })

    const pharmaciesWithDistance = await Promise.all(pharmaciesWithDistancePromises)

    // Sort pharmacies by distance (no radius limit since they're in the same state)
    const sortedPharmacies = pharmaciesWithDistance.sort((a: any, b: any) => a.distance - b.distance)

    console.log(`\n✅ [Result] ${sortedPharmacies.length} pharmacies with distances calculated`)
    sortedPharmacies.forEach(p => {
      console.log(`  • ${p.name}: ${p.distance} km`)
    })

    // Filter out any pharmacies with invalid coordinates (NaN or Infinity)
    const validPharmacies = sortedPharmacies.filter(p => {
      const isValid = typeof p.latitude === 'number' && typeof p.longitude === 'number' &&
        isFinite(p.latitude) && isFinite(p.longitude)
      if (!isValid) {
        console.warn(`⚠️ Filtering out invalid: ${p.name}`)
      }
      return isValid
    })

    console.log(`\n🎯 [Final] ${validPharmacies.length} valid pharmacies returned\n`)
    return NextResponse.json(validPharmacies)
  } catch (error) {
    console.error("[API] Error:", error)
    Sentry.captureException(error, {
      tags: { api: 'pharmacies', action: 'general_error' },
      level: 'error'
    })
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
