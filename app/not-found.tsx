import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileSearch } from "lucide-react"

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4" dir="rtl">
      <div className="max-w-lg w-full bg-white border border-blue-100 shadow-xl rounded-2xl p-8 space-y-4 text-center">
        <div className="flex justify-center">
          <FileSearch className="h-12 w-12 text-blue-500" />
        </div>
        <h1 className="text-2xl font-bold text-blue-900">الصفحة غير موجودة</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          ربما تم نقل الصفحة أو حذفها. تأكد من الرابط أو عد إلى الصفحة الرئيسية.
        </p>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/">العودة للرئيسية</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
