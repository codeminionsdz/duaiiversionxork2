# ✅ تقرير التجهيز للمتاجر - تطبيق دوائي

**التاريخ:** 26 ديسمبر 2025  
**الإصدار:** 1.5.0  
**الحالة:** جاهز للمتاجر مع بعض الخطوات اليدوية المتبقية

---

## 📊 ملخص الإنجازات

### ✅ ما تم إنجازه (7/8 مهام)

| # | المهمة | الحالة | التفاصيل |
|---|--------|--------|----------|
| 1 | تحديث versionCode & versionName | ✅ مكتمل | versionCode: 2, versionName: 1.5.0 |
| 2 | Privacy Policy صفحة HTML | ✅ مكتمل | `/privacy-policy` - احترافية وشاملة |
| 3 | Sentry للتتبع | ✅ مكتمل | مُثبّت ومُعدّ بالكامل |
| 4 | دليل google-services.json | ✅ مكتمل | `FIREBASE_SETUP_GUIDE.md` |
| 5 | Rate Limiting | ✅ مكتمل | مُضاف على pharmacies API |
| 6 | Service Worker | ✅ موجود | محسّن ويعمل بالفعل |
| 7 | إعدادات build.gradle | ✅ مُحدّث | جاهز لإضافة keystore |
| 8 | Keystore للتوقيع | ⚠️ يدوي | **يحتاج JDK** |

---

## 🔧 التغييرات التقنية

### 1️⃣ **android/app/build.gradle**

```groovy
✅ versionCode: 2 (كان 1)
✅ versionName: "1.5.0" (كان "1.0")
✅ إضافة signingConfigs (معطّل حالياً - يُفعّل بعد إنشاء keystore)
```

### 2️⃣ **app/privacy-policy/page.tsx**

```tsx
✅ محتوى شامل باللغة العربية
✅ تصميم احترافي مع dark mode
✅ 12 قسم تغطي جميع جوانب الخصوصية
✅ رابط مباشر: https://duaiinow.vercel.app/privacy-policy
```

### 3️⃣ **Sentry Error Tracking**

```typescript
✅ مثبت: @sentry/nextjs
✅ ملفات الإعداد:
   - sentry.client.config.ts
   - sentry.server.config.ts
   - sentry.edge.config.ts
✅ مدمج في next.config.js
✅ مضاف في pharmacies API route
```

**ما يحتاج:**
- إنشاء مشروع على https://sentry.io
- وضع DSN في `.env.local`:
  ```
  NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project
  ```

### 4️⃣ **Rate Limiting**

```typescript
✅ ملف موجود: lib/rate-limit.ts
✅ مضاف على: app/api/pharmacies/route.ts
✅ معدّلات:
   - Search: 30 req/min
   - Auth: 5 req/min
   - Prescription: 10 req/min
   - General API: 50 req/min
```

### 5️⃣ **Firebase Setup Guide**

```
✅ ملف: FIREBASE_SETUP_GUIDE.md
✅ خطوات تفصيلية لتحميل google-services.json
✅ شرح Firebase Console
✅ تعليمات FCM
```

---

## ⚠️ ما يحتاج عمل يدوي

### 🔴 **أساسي (قبل الرفع للمتاجر)**

#### 1. إنشاء Keystore للتوقيع

**المشكلة:** Java/JDK غير مثبت على الجهاز

**الحل:**

```powershell
# أ. تثبيت JDK (إذا لم يكن مثبتاً)
# حمّل من: https://www.oracle.com/java/technologies/downloads/
# اختر: Java SE 17 LTS - Windows x64 Installer

# ب. بعد التثبيت، إنشاء keystore:
cd c:\Users\codem\OneDrive\project\duaii\android
keytool -genkey -v -keystore duaii-release-key.keystore -alias duaii -keyalg RSA -keysize 2048 -validity 10000

# ملاحظة: احفظ كلمة المرور في مكان آمن!
```

#### 2. تفعيل التوقيع في build.gradle

بعد إنشاء keystore، فعّل التوقيع:

```groovy
// في android/app/build.gradle
signingConfigs {
    release {
        storeFile file('duaii-release-key.keystore')
        storePassword 'YOUR_PASSWORD'
        keyAlias 'duaii'
        keyPassword 'YOUR_PASSWORD'
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release // فعّل هذا السطر
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

#### 3. تحميل google-services.json

```
1. اذهب إلى: https://console.firebase.google.com/
2. اختر المشروع
3. Project Settings → Your apps → Android
4. حمّل google-services.json
5. ضعه في: android/app/google-services.json
```

#### 4. إعداد Sentry

```
1. اذهب إلى: https://sentry.io
2. أنشئ حساب مجاني
3. أنشئ مشروع Next.js
4. احصل على DSN
5. أضفه في .env.local:
   NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project
```

#### 5. التقاط Screenshots للمتجر

```
✅ اِلتقط 4-8 صور من التطبيق:
   - الصفحة الرئيسية
   - خريطة الصيدليات
   - رفع وصفة
   - إشعارات
   - الملف الشخصي
   
✅ دقة الصور:
   - Phone: 1080 x 1920 px أو أعلى
   - Tablet: 1920 x 1080 px
```

#### 6. أيقونة التطبيق

```
✅ تحقق من:
   - public/icon.svg (موجود)
   - public/images/logo.png (موجود)
   
⚠️ للمتجر تحتاج:
   - 512 x 512 px PNG (Google Play)
   - 1024 x 1024 px PNG (Apple App Store)
```

---

## 🟢 **اختياري (يمكن لاحقاً)**

### Input Validation (Zod)

```bash
npm install zod
```

ثم أضف validation في signup/login forms.

### Upstash Redis (Rate Limiting أفضل)

```bash
npm install @upstash/ratelimit @upstash/redis
```

للـ production، استبدل in-memory rate limit بـ Redis.

---

## 📝 خطوات الرفع إلى Google Play

### المرحلة 1: إعداد التطبيق

- [x] تحديث versionCode & versionName
- [x] Privacy Policy URL: https://duaiinow.vercel.app/privacy-policy
- [ ] إنشاء keystore
- [ ] تحميل google-services.json
- [ ] بناء Release APK/AAB

### المرحلة 2: بناء الإصدار

```bash
# 1. تحديث التبعيات
npm install

# 2. بناء Next.js
npm run build

# 3. مزامنة Capacitor
npx cap sync android

# 4. فتح Android Studio
npx cap open android

# 5. في Android Studio:
# Build → Generate Signed Bundle / APK → Android App Bundle (.aab)
# اختر keystore الذي أنشأته
# اختر "release"
# انتظر البناء
```

### المرحلة 3: Google Play Console

1. **اذهب إلى:** https://play.google.com/console/
2. **أنشئ تطبيق جديد:**
   - الاسم: دوائي
   - اللغة الافتراضية: العربية
   - النوع: تطبيق / لعبة: تطبيق
   - مجاني / مدفوع: مجاني

3. **املأ تفاصيل التطبيق:**
   - الوصف القصير (80 حرف)
   - الوصف الكامل (4000 حرف)
   - Screenshots (4-8 صور)
   - أيقونة (512 x 512 px)
   - Feature graphic (1024 x 500 px)

4. **Content rating:**
   - املأ الاستبيان
   - التطبيق مناسب لجميع الأعمار

5. **Privacy Policy:**
   - URL: https://duaiinow.vercel.app/privacy-policy

6. **Data safety:**
   - حدد البيانات التي تجمعها
   - الموقع، البريد الإلكتروني، الصور

7. **ارفع AAB:**
   - Production → Create new release
   - ارفع ملف `.aab`
   - اكتب Release notes بالعربية

8. **أرسل للمراجعة:**
   - قد تستغرق 1-7 أيام

---

## 🎯 الحالة النهائية

### ✅ جاهز

- [x] الكود نظيف ومنظم
- [x] Privacy Policy منشورة
- [x] Error tracking (Sentry)
- [x] Rate limiting
- [x] PWA Service Worker
- [x] Offline support
- [x] RTL/Arabic support
- [x] Dark mode
- [x] الإشعارات (تحتاج google-services.json فقط)
- [x] الخرائط والموقع
- [x] المصادقة كاملة

### ⚠️ يحتاج عمل يدوي (1-2 ساعة)

- [ ] تثبيت JDK وإنشاء keystore
- [ ] تحميل google-services.json من Firebase
- [ ] إعداد Sentry DSN
- [ ] التقاط screenshots
- [ ] بناء Release AAB
- [ ] إنشاء حساب Google Play Console
- [ ] رفع التطبيق

---

## 📞 الدعم

**إذا واجهت مشاكل:**

1. **Keystore:** راجع دليل Android الرسمي
2. **Firebase:** راجع `FIREBASE_SETUP_GUIDE.md`
3. **Sentry:** راجع https://docs.sentry.io/platforms/javascript/guides/nextjs/
4. **Google Play:** راجع https://support.google.com/googleplay/android-developer/

---

## 🚀 التطبيق جاهز تقنياً!

المطلوب فقط إكمال الخطوات اليدوية (JDK + Firebase + Sentry) ثم الرفع.

**وقت العمل المتبقي:** 1-2 ساعة (بدون وقت المراجعة من Google)

---

**🎉 أحسنت! التطبيق في حالة ممتازة وجاهز للإطلاق.**
