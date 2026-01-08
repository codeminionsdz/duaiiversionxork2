"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { LogIn, Mail, Lock, Sparkles } from "lucide-react"
import { loginSchema, getFirstErrorMessage } from "@/lib/validation"
import { apiFetch } from "@/lib/api-client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 🔒 VALIDATE INPUT FIRST
      const validationResult = loginSchema.safeParse({
        email,
        password,
      })

      // ❌ Return early if validation fails
      if (!validationResult.success) {
        toast({
          title: "خطأ في البيانات",
          description: getFirstErrorMessage(validationResult.error.issues),
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: validationResult.data.email,
          password: validationResult.data.password,
        }),
      })

      const data = await res.json()

      console.log("📥 Login response:", { status: res.status, data });

      if (!res.ok) {
        console.error("❌ Login failed:", data);
        const errorMessage = data?.error || "تعذر تسجيل الدخول"
        if (errorMessage.includes("Invalid login credentials")) {
          throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة")
        } else if (errorMessage.includes("Email not confirmed")) {
          throw new Error("يرجى تأكيد بريدك الإلكتروني أولاً")
        }
        throw new Error(errorMessage)
      }

      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في دوائي",
      })

      const redirectTo = data?.redirectTo || (data?.role === "pharmacy" ? "/pharmacy/dashboard" : "/home")
      router.replace(redirectTo)
      
      router.refresh()
    } catch (error: unknown) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error instanceof Error ? error.message : "حدث خطأ ما",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div suppressHydrationWarning className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="absolute top-20 right-10 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-24 h-24 mb-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl p-4 shadow-2xl cute-card">
            <img src="/images/logo.png" alt="دوائي" className="w-full h-full object-contain p-2" />
            <div className="absolute -top-2 -right-2">
              <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            دوائي
          </h1>
          <p className="text-muted-foreground text-center font-medium">صيدليتك في جيبك</p>
        </div>

        <Card className="shadow-2xl border-2 border-emerald-100 rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1 bg-gradient-to-br from-emerald-50 to-white pb-6">
            <CardTitle className="text-2xl text-center font-bold text-emerald-900">تسجيل الدخول</CardTitle>
            <CardDescription className="text-center">أدخل بياناتك للوصول إلى حسابك</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">
                  البريد الإلكتروني
                </Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3.5 h-5 w-5 text-emerald-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-11 h-12 border-2 border-emerald-100 focus:border-emerald-300 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3.5 h-5 w-5 text-emerald-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-11 h-12 border-2 border-emerald-100 focus:border-emerald-300 rounded-xl"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 font-bold text-base shadow-lg cute-button rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  "جاري تسجيل الدخول..."
                ) : (
                  <>
                    <LogIn className="ml-2 h-5 w-5" />
                    تسجيل الدخول
                  </>
                )}
              </Button>

              <div className="text-center text-sm pt-2">
                <span className="text-muted-foreground">ليس لديك حساب؟ </span>
                <Link href="/auth/signup" className="text-emerald-600 hover:text-emerald-700 font-bold">
                  إنشاء حساب جديد
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          بتسجيل الدخول، أنت توافق على
          {' '}
          <Link href="/terms-of-service" className="text-emerald-600 hover:underline font-semibold">شروط الاستخدام</Link>
          {' '}و
          {' '}
          <Link href="/privacy-policy" className="text-emerald-600 hover:underline font-semibold">سياسة الخصوصية</Link>
        </p>
      </div>
    </div>
  )
}
