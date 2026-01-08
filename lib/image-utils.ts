/**
 * تحويل مسار صورة إلى Signed URL (للـ private buckets)
 * يدعم جميع الصيغ (نسبي، مطلق، public URL)
 */
export async function getImagePublicUrl(imagePath: string | null): Promise<string | null> {
  if (!imagePath) return null

  // إذا كانت بالفعل URL عام أو signed، أعدها كما هي
  if (imagePath.startsWith("http")) {
    return imagePath
  }

  try {
    // استخدام API endpoint لتوليد signed URL
    // هذا يتجاوز قيود RLS ويستخدم admin client
    const response = await fetch("/api/images/signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imagePath }),
    })

    if (!response.ok) {
      console.error("❌ فشل في الحصول على Signed URL:", response.statusText)
      return null
    }

    const data = await response.json()
    return data.signedUrl || null
  } catch (error) {
    console.error("❌ خطأ في الحصول على صورة:", error)
    return null
  }
}

/**
 * تحويل مصفوفة من مسارات الصور إلى URLs عامة
 */
export async function getImagesPublicUrls(imagePaths: (string | null)[]): Promise<string[]> {
  const urls = await Promise.all(
    imagePaths.map(async (path) => {
      const url = await getImagePublicUrl(path)
      return url || null
    })
  )

  return urls.filter((url): url is string => url !== null)
}

/**
 * دالة آمنة للحصول على الصور - تتعامل مع جميع الحالات
 */
export async function getImagesFromPrescription(
  imagePathsOrUrls: (string | null)[] | null | undefined
): Promise<string[]> {
  if (!imagePathsOrUrls || !Array.isArray(imagePathsOrUrls)) {
    return []
  }

  return getImagesPublicUrls(imagePathsOrUrls)
}
