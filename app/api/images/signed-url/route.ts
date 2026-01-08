import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

/**
 * API endpoint لتوليد Signed URLs للصور
 * يستخدم service role key للتجاوز RLS
 */
export async function POST(request: NextRequest) {
  try {
    const { imagePath } = await request.json()

    if (!imagePath || typeof imagePath !== "string") {
      return NextResponse.json(
        { error: "imagePath مطلوب" },
        { status: 400 }
      )
    }

    // تنظيف المسار
    let cleanPath = imagePath
      .replace(/^prescriptions\//, "")
      .replace(/^\//, "")
      .trim()

    if (!cleanPath) {
      return NextResponse.json(
        { error: "المسار غير صحيح" },
        { status: 400 }
      )
    }

    // إذا كانت بالفعل signed URL، أعدها كما هي
    if (cleanPath.startsWith("http")) {
      return NextResponse.json({ signedUrl: cleanPath })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // إنشاء signed URL (صالح لمدة 7 أيام)
    const { data, error } = await supabase.storage
      .from("prescriptions")
      .createSignedUrl(cleanPath, 60 * 60 * 24 * 7)

    if (error || !data?.signedUrl) {
      console.error("❌ خطأ في إنشاء Signed URL:", error)
      return NextResponse.json(
        { error: "فشل في إنشاء Signed URL" },
        { status: 500 }
      )
    }

    return NextResponse.json({ signedUrl: data.signedUrl })
  } catch (error) {
    console.error("❌ خطأ في API:", error)
    return NextResponse.json(
      { error: "خطأ في الخادم" },
      { status: 500 }
    )
  }
}
