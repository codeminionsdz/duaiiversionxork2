import { createClient as createAdminClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from("prescriptions")
      .select("id, user_id, status, created_at, notes, images_urls")
      .order("created_at", { ascending: false })
      .limit(10000)

    if (error) throw error

    // Generate signed URLs for prescription images
    const prescriptionsWithSignedUrls = await Promise.all(
      (data || []).map(async (prescription) => {
        const signedUrls: string[] = []
        
        if (prescription.images_urls && Array.isArray(prescription.images_urls)) {
          for (const imageUrl of prescription.images_urls) {
            try {
              if (typeof imageUrl === "string" && imageUrl) {
                let filePath = imageUrl
                
                // If it's a full URL, extract the file path
                if (filePath.includes("http")) {
                  // Method 1: URL contains /object/public/prescriptions/
                  if (filePath.includes("/object/public/prescriptions/")) {
                    const parts = filePath.split("/object/public/prescriptions/")
                    filePath = parts[1] || ""
                  }
                  // Method 2: URL contains /storage/v1/object/
                  else if (filePath.includes("/storage/v1/object/")) {
                    const parts = filePath.split("/prescriptions/")
                    filePath = parts[1] || ""
                  }
                }
                // If it's already just a path, clean it up
                else if (filePath.startsWith("prescriptions/")) {
                  filePath = filePath.replace("prescriptions/", "")
                }
                
                if (filePath) {
                  const { data: signed, error: signErr } = await supabase
                    .storage
                    .from("prescriptions")
                    .createSignedUrl(filePath, 60 * 60 * 24 * 7) // 7 days
                  
                  if (!signErr && signed?.signedUrl) {
                    signedUrls.push(signed.signedUrl)
                  } else {
                    signedUrls.push(imageUrl) // fallback to original
                    if (signErr) {
                      console.error("❌ Signing prescription image failed for", filePath, signErr)
                    }
                  }
                } else {
                  signedUrls.push(imageUrl) // not a storage URL
                }
              } else {
                signedUrls.push(imageUrl) // invalid URL
              }
            } catch (e) {
              console.error("❌ Error generating signed URL:", e)
              signedUrls.push(imageUrl) // fallback
            }
          }
        }
        
        return { ...prescription, images_urls: signedUrls }
      })
    )

    return Response.json(prescriptionsWithSignedUrls)
  } catch (error) {
    console.error("❌ Error fetching prescriptions:", error)
    return Response.json([], { status: 500 })
  }
}
