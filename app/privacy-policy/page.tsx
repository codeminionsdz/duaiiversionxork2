import React from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'سياسة الخصوصية - دوائي',
}

export default function PrivacyPolicyPage() {
  const updated = new Date('2025-12-26').toLocaleDateString('ar-SA')

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800" dir="rtl">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-center text-blue-600 dark:text-blue-400 mb-2">سياسة الخصوصية - تطبيق دوائي</h1>
        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-8">آخر تحديث: {updated}</p>

        <section className="space-y-8 text-gray-700 dark:text-gray-300">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">مقدمة</h2>
            <p className="leading-relaxed">مرحباً في دوائي. نحن نحترم خصوصيتك ونحرص على حماية معلوماتك الشخصية. هذا المستند يشرح ببساطة ما نجمعه، لماذا، وكيف نتعامل مع بياناتك على الويب، كـ PWA، وعلى أندرويد.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">1) من نحن</h2>
            <p className="leading-relaxed">دوائي هو تطبيق للبحث عن الأدوية والتواصل مع الصيدليات. نحن نستضيف البيانات ونشغّل الخدمات عبر Supabase.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">2) ما البيانات التي نجمعها</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>بيانات التسجيل:</strong> البريد الإلكتروني، الاسم (اختياري)، دور الحساب (مستخدم / صيدلية)</li>
              <li><strong>بيانات الموقع:</strong> إحداثيات GPS (اختياري) تُستخدم فقط عند منح الإذن لتقديم خدمات القرب وحساب المسافات</li>
              <li><strong>الوصفات الطبية:</strong> صور الوصفات والبيانات الوصفية ذات الصلة التي يرفعها المستخدم</li>
              <li><strong>بيانات الإشعارات:</strong> اشتراكات الإعلام (Push subscription) لإرسال إشعارات متعلقة بالوصفات</li>
              <li><strong>بيانات استخدام التطبيق:</strong> صفحات زرتها، تفاعلات، أخطاء (لتحسين التطبيق)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">3) لماذا نحتاج هذه البيانات</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>البريد الإلكتروني:</strong> لتسجيل الدخول، استعادة الحساب، وإرسال رسائل مهمة</li>
              <li><strong>الموقع:</strong> لإيجاد صيدليات قريبة وحساب المسافات (يطلب فقط عند الحاجة)</li>
              <li><strong>الوصفات:</strong> لتخزين ومشاركة الوصفة مع الصيدليات لطلب الدواء</li>
              <li><strong>الإشعارات:</strong> لإخطارك بتحديثات حالة الوصفة أو رد الصيدلية</li>
              <li><strong>بيانات الاستخدام:</strong> لفهم الأخطاء وتحسين تجربة التطبيق</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">4) التصاريح (Permissions)</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>الموقع (GPS):</strong> مطلوب فقط إن رغبت في اكتشاف صيدليات قربك. يمكنك رفضه والاستمرار</li>
              <li><strong>الإشعارات:</strong> لتمكين التنبيهات. يمكنك تعطيلها في أي وقت</li>
              <li><strong>الكاميرا/الملفات:</strong> لالتقاط أو رفع صور الوصفات فقط</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">5) أين تُخزن البيانات</h2>
            <p className="leading-relaxed">نستخدم Supabase لتخزين المستخدمين وملفات الوصفات والاشتراكات. جميع الملفات في وحدة تخزين آمنة. المفاتيح السرية محفوظة في بيئة الخادم ولا تُعرض للعامة.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">6) من يمكنه الوصول</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>أنت (مالك الحساب) والصيدليات التي تختار مشاركة وصفتك معها</li>
              <li>مسؤولون موثوقون لتشغيل النظام (بصلاحيات محدودة)</li>
              <li><strong>لا نبيع بيانات المستخدمين لأطراف ثالثة أبداً</strong></li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">7) مدة الاحتفاظ</h2>
            <p className="leading-relaxed">نحتفظ بالبيانات طالما أن الحساب نشط. يمكنك طلب حذف حسابك وبياناتك في أي وقت.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">8) حقوقك كمستخدم</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>الوصول:</strong> اطلع على بياناتك عبر صفحة الملف الشخصي</li>
              <li><strong>التصحيح:</strong> حدّث بياناتك من الإعدادات</li>
              <li><strong>الحذف:</strong> اطلب حذف حسابك عبر التواصل معنا</li>
              <li><strong>إلغاء الاشتراك:</strong> أوقف الإشعارات من إعدادات الجهاز</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">9) الأمان</h2>
            <p className="leading-relaxed">نستخدم HTTPS لتشفير البيانات. جميع كلمات المرور مُشفرة (hashed). نطبّق Row-Level Security (RLS) على قاعدة البيانات لحماية بياناتك.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">10) خصوصية الأطفال</h2>
            <p className="leading-relaxed">التطبيق موجّه للبالغين (18+). لا نجمع بيانات من أطفال دون 18 سنة عن عمد.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">11) التغييرات على هذه السياسة</h2>
            <p className="leading-relaxed">نحتفظ بالحق في تحديث هذه السياسة. سنُعلمك بأي تغييرات جوهرية عبر إشعار في التطبيق أو بريد إلكتروني.</p>
          </div>

          <div className="bg-blue-50 dark:bg-gray-700 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">12) التواصل معنا</h2>
            <p className="leading-relaxed mb-4">لأي أسئلة أو طلبات تتعلق بالخصوصية:</p>
            <p className="text-lg"><strong>📧 البريد الإلكتروني:</strong> <a href="mailto:support@duaii.app" className="text-blue-600 dark:text-blue-400 hover:underline">support@duaii.app</a></p>
            <p className="text-lg mt-2"><strong>🌐 الموقع:</strong> <a href="https://duaiinow.vercel.app" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">duaiinow.vercel.app</a></p>
          </div>
        </section>

        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            تطبيق دوائي © 2025 - جميع الحقوق محفوظة
          </p>
          <Link href="/" className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </main>
  )
}
