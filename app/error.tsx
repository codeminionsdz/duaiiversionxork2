"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("Global error caught:", error)
  }, [error])

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-4" dir="rtl">
      <div className="max-w-lg w-full bg-white border border-emerald-100 shadow-xl rounded-2xl p-8 space-y-4 text-center">
        <div className="flex justify-center">
          <AlertCircle className="h-12 w-12 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-emerald-900">عذراً، حدث خطأ غير متوقع</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          واجهنا مشكلة أثناء تشغيل التطبيق. يمكنك إعادة المحاولة أو العودة للصفحة الرئيسية.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            إعادة المحاولة
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">العودة للرئيسية</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
