"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { UserPlus, Sparkles } from 'lucide-react'
import { createClient } from "@/lib/supabase/client"
import { apiFetch } from "@/lib/api-client"

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  const [role, setRole] = useState<"user" | "pharmacy">("user")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [phone, setPhone] = useState("")

  // Pharmacy fields (stored after email verification)
  const [pharmacyName, setPharmacyName] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [address, setAddress] = useState("")

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    
    if (!fullName.trim()) {
      toast({ title: "الاسم مطلوب", description: "يرجى إدخال الاسم الكامل", variant: 'destructive' })
      return
    }

    if (!email.trim()) {
      toast({ title: "البريد مطلوب", description: "يرجى إدخال بريدك الإلكتروني", variant: 'destructive' })
      return
    }

    if (password !== confirmPassword) {
      toast({ title: "كلمة المرور غير متطابقة", description: "تأكد من مطابقة كلمتي المرور", variant: 'destructive' })
      return
    }

    if (password.length < 8) {
      toast({ title: "كلمة المرور ضعيفة", description: "يجب أن تكون كلمة المرور 8 أحرف على الأقل", variant: 'destructive' })
      return
    }

    if (role === "pharmacy") {
      if (!pharmacyName.trim()) {
        toast({ title: "اسم الصيدلية مطلوب", description: "يرجى إدخال اسم الصيدلية", variant: 'destructive' })
        return
      }
      if (!licenseNumber.trim()) {
        toast({ title: "رقم الترخيص مطلوب", description: "يرجى إدخال رقم الترخيص", variant: 'destructive' })
        return
      }
    }

    setIsLoading(true)

    try {
      // استخدام API endpoint بدلاً من client signup
      // لأن هناك مشكلة في Supabase triggers
      const payload: any = {
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        phone: phone?.trim() || null,
        role,
      }

      if (role === 'pharmacy') {
        payload.pharmacy = {
          pharmacy_name: pharmacyName.trim(),
          license_number: licenseNumber.trim(),
          address: address?.trim() || null,
        }
      }

      console.log("📤 Sending signup to API:", payload);

      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))

      console.log("📥 API Response:", { status: res.status, data });

      if (!res.ok) {
        throw new Error(data?.details || data?.error || 'فشل إنشاء الحساب')
      }

      toast({
        title: 'تم إنشاء الحساب بنجاح',
        description: 'يمكنك الآن تسجيل الدخول',
      })

      // Redirect to login directly (no email confirmation needed)
      router.push('/auth/login')
    } catch (err: any) {
      console.error('❌ Signup failed:', err)
      
      let errorMessage = err?.message || 'فشل إنشاء الحساب'
      
      // Handle specific Supabase errors
      if (err?.message?.includes('already registered')) {
        errorMessage = 'هذا البريد الإلكتروني مسجل بالفعل'
      } else if (err?.message?.includes('invalid email')) {
        errorMessage = 'صيغة البريد الإلكتروني غير صحيحة'
      }
      
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="w-full max-w-md mx-auto px-4">
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-24 h-24 mb-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl p-4 shadow-2xl">
            <img src="/images/logo.png" alt="دوائي" className="w-full h-full object-contain p-1" />
            <div className="absolute -top-2 -right-2">
              <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">إنشاء حساب</h1>
        </div>

        <Card className="shadow-sm border border-emerald-100 rounded-2xl overflow-hidden">
          <CardHeader className="space-y-1 pb-3 bg-gradient-to-br from-emerald-50 to-white">
            <CardTitle className="text-lg text-center font-semibold text-emerald-900">انضم إلى دوائي</CardTitle>
            <CardDescription className="text-center text-sm text-slate-600">اختر نوع الحساب وأدخل بياناتك</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 px-6 pb-6">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="inline-flex rounded-xl bg-emerald-50 p-1 shadow-inner">
                  <button type="button" onClick={() => setRole('user')} className={`px-4 py-2 rounded-lg text-sm font-medium ${role === 'user' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'text-emerald-700'}`}>مستخدم</button>
                  <button type="button" onClick={() => setRole('pharmacy')} className={`ml-1 px-4 py-2 rounded-lg text-sm font-medium ${role === 'pharmacy' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'text-emerald-700'}`}>صيدلية</button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">{role === 'pharmacy' ? 'اسم المسؤول' : 'الاسم الكامل'}</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="الاسم الكامل" required />
              </div>

              {role === 'pharmacy' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="pharmacyName">اسم الصيدلية</Label>
                    <Input id="pharmacyName" value={pharmacyName} onChange={(e) => setPharmacyName(e.target.value)} placeholder="اسم الصيدلية" />
                  </div>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <Input id="licenseNumber" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="رقم الترخيص" />
                    <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="العنوان" />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone">رقم الجوال</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xxxxxxxx" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
              </div>

              <Button type="submit" className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600" disabled={isLoading}>
                {isLoading ? 'جاري الإنشاء...' : (
                  <>
                    <UserPlus className="ml-2 h-5 w-5" /> إنشاء حساب
                  </>
                )}
              </Button>

              <div className="text-center text-sm pt-2">
                <span className="text-muted-foreground">لديك حساب بالفعل؟ </span>
                <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-medium">تسجيل الدخول</Link>
              </div>

              <div className="text-center text-xs text-muted-foreground mt-3">
                بإنشاء حساب، أنت توافق على <Link href="/terms-of-service" className="text-emerald-600">شروط الاستخدام</Link> و <Link href="/privacy-policy" className="text-emerald-600">سياسة الخصوصية</Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
