# 🏥 دوائي (Duaiii) - منصة توصيل الأدوية

<div align="center">

![Duaiii Logo](public/images/logo.png)

**منصة شاملة لربط المرضى بالصيدليات لتوصيل الأدوية بسرعة وأمان**

[![Next.js](https://img.shields.io/badge/Next.js-14.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[الميزات](#-الميزات) • [البدء السريع](#-البدء-السريع) • [التوثيق](#-التوثيق) • [المساهمة](#-المساهمة)

</div>

---

## 📋 نظرة عامة

**دوائي** هو تطبيق ويب متقدم (PWA) يسهل عملية طلب وتوصيل الأدوية من الصيدليات القريبة. يوفر التطبيق:

- 🔐 نظام مصادقة آمن للمرضى والصيدليات
- 📸 رفع الوصفات الطبية بالصور
- 🗺️ خريطة تفاعلية لعرض الصيدليات القريبة (50 كم)
- 🔔 إشعارات فورية للطلبات الجديدة
- 📊 لوحة تحكم إدارية شاملة
- 📱 تطبيق قابل للتثبيت (PWA)
- 🚀 يعمل بدون إنترنت (Offline Support)

---

## ✨ الميزات

### للمرضى
- ✅ تسجيل حساب جديد بسهولة
- ✅ رفع الوصفات الطبية (صور متعددة)
- ✅ اختيار الصيدليات القريبة تلقائياً
- ✅ تتبع حالة الطلب (قيد المراجعة، مقبول، رُفض، جاهز، قيد التوصيل، مكتمل)
- ✅ إضافة الصيدليات المفضلة
- ✅ تصفح قائمة الأدوية المتاحة
- ✅ تلقي إشعارات فورية

### للصيدليات
- ✅ لوحة تحكم خاصة
- ✅ إدارة الطلبات الواردة
- ✅ إدارة قائمة الأدوية المتاحة
- ✅ إشعارات فورية بالطلبات الجديدة
- ✅ تحديث حالة الطلبات
- ✅ إدارة الملف الشخصي

### للإداريين
- ✅ لوحة تحكم شاملة بالإحصائيات
- ✅ إدارة جميع الوصفات والطلبات
- ✅ تحليلات مفصلة (Analytics)
- ✅ إدارة الصيدليات والمستخدمين

---

## 🚀 البدء السريع

### المتطلبات

- **Node.js**: 18.x أو أحدث
- **npm** أو **pnpm**
- حساب **Supabase** (مجاني)
- حساب **Firebase** (اختياري - للإشعارات)

### التثبيت

```bash
# 1. استنساخ المشروع
git clone https://github.com/codeminionsdz/duaii.git
cd duaii

# 2. تثبيت المكتبات
npm install

# 3. نسخ ملف البيئة
cp .env.example .env.local

# 4. تعديل متغيرات البيئة
# افتح .env.local وأضف مفاتيحك

# 5. تشغيل قاعدة البيانات
# افتح Supabase Dashboard واشغل scripts/021_add_pwa_analytics.sql

# 6. تشغيل المشروع
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح

---

## 🐳 Docker

### تشغيل المشروع باستخدام Docker

```bash
# بناء وتشغيل
docker-compose up -d

# إيقاف
docker-compose down

# إعادة البناء
docker-compose up --build
```

---

## 📁 هيكل المشروع

```
duaii/
├── app/                    # Next.js App Router
│   ├── actions/           # Server Actions
│   ├── api/               # API Routes
│   ├── auth/              # صفحات المصادقة
│   ├── home/              # الصفحة الرئيسية
│   ├── prescriptions/     # إدارة الوصفات
│   ├── pharmacy/          # لوحة الصيدلية
│   └── admin/             # لوحة الإدارة
├── components/            # مكونات React
│   ├── ui/               # مكونات UI (Radix + shadcn)
│   ├── home/             # مكونات الصفحة الرئيسية
│   └── pharmacy/         # مكونات الصيدلية
├── hooks/                # React Hooks مخصصة
├── lib/                  # مكتبات مساعدة
├── public/               # ملفات ثابتة
│   ├── sw.js            # Service Worker
│   └── manifest.json    # PWA Manifest
├── scripts/              # SQL Scripts
├── tests/                # الاختبارات
├── android/              # Capacitor Android
└── docker/               # Docker configs
```

---

## 🔧 التكوين

### 1. Supabase Setup

```bash
# في Supabase SQL Editor، شغّل:
1. scripts/001_initial_schema.sql
2. scripts/021_add_pwa_analytics.sql
```

### 2. Firebase Setup (اختياري)

```bash
# للإشعارات الفورية
1. أنشئ مشروع في Firebase Console
2. فعّل Firebase Cloud Messaging
3. حمّل google-services.json
4. أضف المفاتيح في .env.local
```

### 3. VAPID Keys

```bash
# لإنشاء مفاتيح VAPID للإشعارات
npx web-push generate-vapid-keys

# أضف المفاتيح في .env.local:
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

---

## 📱 بناء التطبيق للموبايل

### Android APK

```bash
# 1. بناء التطبيق
npm run build

# 2. إضافة Android
npx cap add android

# 3. نسخ الملفات
npx cap sync

# 4. فتح Android Studio
npx cap open android

# 5. في Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
```

راجع [APK_BUILD_GUIDE.md](APK_BUILD_GUIDE.md) للتفاصيل الكاملة.

---

## 🧪 الاختبارات

```bash
# تشغيل جميع الاختبارات
npm test

# تشغيل الاختبارات مع Coverage
npm run test:coverage

# تشغيل الاختبارات في وضع Watch
npm run test:watch

# Linting
npm run lint

# Type Checking
npm run type-check
```

---

## 📊 التحليلات والمراقبة

- **Analytics**: مدمج في لوحة الإدارة `/admin`
- **Sentry**: لتتبع الأخطاء (يحتاج إعداد DSN)
- **Vercel Analytics**: تحليلات الأداء

---

## 🔒 الأمان

- ✅ Row Level Security (RLS) في Supabase
- ✅ JWT Authentication
- ✅ Input validation باستخدام Zod
- ✅ Rate limiting على API endpoints
- ✅ HTTPS فقط في الإنتاج
- ✅ CSP Headers
- ✅ XSS Protection

---

## 🌐 النشر

### Vercel (موصى به)

```bash
# ربط المشروع
vercel

# النشر إلى الإنتاج
vercel --prod
```

### Docker Production

```bash
# بناء Docker Image
docker build -t duaii:latest .

# تشغيل Container
docker run -p 3000:3000 duaii:latest
```

---

## 🛠️ تقنيات المستخدمة

| التقنية | الاستخدام |
|---------|-----------|
| [Next.js 14](https://nextjs.org/) | React Framework |
| [TypeScript](https://www.typescriptlang.org/) | Type Safety |
| [Supabase](https://supabase.com/) | Database + Auth |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [Radix UI](https://www.radix-ui.com/) | UI Components |
| [React Hook Form](https://react-hook-form.com/) | Form Management |
| [Zod](https://zod.dev/) | Schema Validation |
| [Leaflet](https://leafletjs.com/) | Interactive Maps |
| [Firebase](https://firebase.google.com/) | Push Notifications |
| [Sentry](https://sentry.io/) | Error Tracking |
| [Capacitor](https://capacitorjs.com/) | Mobile Wrapper |

---

## 📖 التوثيق

- [دليل البدء السريع](_START_HERE.md)
- [دليل المصادقة](AUTH_QUICK_START.md)
- [دليل الإشعارات](NOTIFICATIONS_QUICK_START.md)
- [دليل بناء APK](APK_BUILD_GUIDE.md)
- [دليل Google Play](APK_GOOGLE_PLAY_GUIDE.md)
- [معمارية النظام](ARCHITECTURE_OVERVIEW.md)

---

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى اتباع الخطوات التالية:

1. Fork المشروع
2. أنشئ فرع للميزة الجديدة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى الفرع (`git push origin feature/AmazingFeature`)
5. افتح Pull Request

---

## 📝 الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE)

---

## 👥 الفريق

- **تطوير**: Code Minions DZ
- **التصميم**: فريق دوائي

---

## 📞 التواصل

- **Website**: [duaiinow.vercel.app](https://duaiinow.vercel.app)
- **GitHub**: [@codeminionsdz](https://github.com/codeminionsdz)
- **Email**: support@duaii.com

---

## 🙏 شكر خاص

شكراً لجميع المساهمين والمكتبات مفتوحة المصدر المستخدمة في هذا المشروع.

---

<div align="center">

**صنع بـ ❤️ في الجزائر**

⭐ إذا أعجبك المشروع، لا تنسى إعطاءه نجمة!

</div>
