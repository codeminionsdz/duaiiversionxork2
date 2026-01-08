import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

interface Medicine {
  name: string
  price: number
  available: boolean
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { prescription_id, medicines, total_price, notes, estimated_time } = body as {
      prescription_id: string
      medicines: Medicine[]
      total_price: number
      notes?: string | null
      estimated_time?: string | null
    }

    if (!prescription_id || !Array.isArray(medicines) || typeof total_price !== 'number') {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert response
    const { error: responseError } = await supabase
      .from("prescription_responses")
      .insert({
        prescription_id,
        pharmacy_id: user.id,
        available_medicines: medicines,
        total_price,
        notes: notes || null,
        estimated_ready_time: estimated_time || null,
      })

    if (responseError) {
      console.error("Failed to insert response:", responseError)
      return Response.json({ error: responseError.message }, { status: 500 })
    }

    // Update prescription status
    const { error: updateError } = await supabase
      .from("prescriptions")
      .update({ status: "responded" })
      .eq("id", prescription_id)

    if (updateError) {
      console.error("Failed to update prescription status:", updateError)
      return Response.json({ error: updateError.message }, { status: 500 })
    }

    // Get prescription to determine patient user_id
    const { data: prescription, error: presError } = await supabase
      .from("prescriptions")
      .select("id, user_id")
      .eq("id", prescription_id)
      .single()

    if (presError || !prescription) {
      console.error("Failed to fetch prescription:", presError)
      return Response.json({ error: "Prescription not found" }, { status: 404 })
    }

    // Create notification for the patient + send push with rich content
    try {
      console.log("🔔 Creating notification for patient:", prescription.user_id)

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

      // Get pharmacy display name for message richness
      const { data: pharmacyProfile } = await supabase
        .from("pharmacy_profiles")
        .select("name")
        .eq("id", user.id)
        .single()

      const pharmacyName = pharmacyProfile?.name || "الصيدلية"
      const medicinesCount = medicines.length
      const summary = medicinesCount > 0
        ? `عدد الأدوية: ${medicinesCount}`
        : "تفاصيل الرد متاحة في التطبيق"
      const priceText = total_price ? `التكلفة التقديرية: ${total_price} دج` : "بدون تسعير حتى الآن"

      // Insert DB notification (in-app list)
      const notifyRes = await fetch(`${appUrl}/api/notifications/create-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: prescription.user_id,
          title: `رد جديد من ${pharmacyName}`,
          message: `${summary} • ${priceText}`,
          type: "pharmacy",
          data: {
            prescription_id,
            pharmacy_id: user.id,
            total_price,
            has_medicines: medicinesCount > 0,
          }
        })
      })

      if (notifyRes.ok) {
        const notifyData = await notifyRes.json()
        console.log("✅ Notification created:", notifyData)
      } else {
        const error = await notifyRes.json()
        console.error("❌ Failed to create notification:", error)
      }

      // Send web push if subscription exists
      try {
        const pushRes = await fetch(`${appUrl}/api/notifications/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: prescription.user_id,
            title: `رد جديد من ${pharmacyName}`,
            body: `${summary} • ${priceText}`,
            url: `${appUrl}/prescriptions/${prescription_id}`,
            tag: `prescription-${prescription_id}`,
            role: 'patient',
            actionType: 'pharmacy_response',
          })
        })

        if (!pushRes.ok) {
          const err = await pushRes.json().catch(() => ({}))
          console.warn("⚠️ Push send failed:", err)
        }
      } catch (pushErr) {
        console.warn("⚠️ Push send error:", pushErr)
      }
    } catch (e) {
      console.error("❌ Error creating notification:", e)
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error("Unexpected error:", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
