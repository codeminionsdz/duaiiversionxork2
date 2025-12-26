# 📱 دليل إعداد Firebase (google-services.json)

## ❌ المشكلة الحالية
ملف `google-services.json` غير موجود في `android/app/`، مما يعني:
- ❌ الإشعارات لن تعمل على Android
- ❌ Firebase Cloud Messaging غير مُفعّل
- ⚠️ التطبيق سيعمل لكن بدون push notifications

---

## 🔧 الحل: تحميل google-services.json

### الخطوة 1: تسجيل الدخول إلى Firebase Console

1. اذهب إلى: https://console.firebase.google.com/
2. سجّل دخول بحساب Google
3. اختر المشروع الموجود أو أنشئ مشروع جديد

### الخطوة 2: إضافة تطبيق Android

إذا لم يكن موجوداً بالفعل:

1. من لوحة Firebase، اضغط على **⚙️ Project Settings**
2. اذهب إلى تبويب **Your apps**
3. اضغط على **+ Add app** → اختر **Android**
4. املأ المعلومات:
   ```
   Android package name: com.duaiii.app
   App nickname: Duaii (اختياري)
   Debug signing certificate SHA-1: (اتركه فارغاً للآن)
   ```
5. اضغط **Register app**

### الخطوة 3: تحميل google-services.json

1. بعد التسجيل، ستظهر لك صفحة التحميل
2. اضغط على **Download google-services.json**
3. احفظ الملف في:
   ```
   c:\Users\codem\OneDrive\project\duaii\android\app\google-services.json
   ```

### الخطوة 4: تفعيل Firebase Cloud Messaging (FCM)

1. في Firebase Console، اذهب إلى **Build** → **Cloud Messaging**
2. إذا طُلب منك تفعيل API، اضغط **Enable**
3. ✅ جاهز!

---

## ✅ التحقق من التثبيت الصحيح

بعد وضع `google-services.json`:

```powershell
# 1. تأكد من وجود الملف
Test-Path "c:\Users\codem\OneDrive\project\duaii\android\app\google-services.json"
# يجب أن يرجع: True

# 2. أعد بناء المشروع
cd c:\Users\codem\OneDrive\project\duaii
npm run build
npx cap sync android

# 3. افتح Android Studio وتأكد من عدم وجود أخطاء
npx cap open android
```

---

## 📋 محتوى google-services.json (مثال)

الملف يجب أن يبدو هكذا:

```json
{
  "project_info": {
    "project_number": "123456789012",
    "project_id": "duaii-app",
    "storage_bucket": "duaii-app.appspot.com"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:123456789012:android:abc123def456",
        "android_client_info": {
          "package_name": "com.duaiii.app"
        }
      },
      "oauth_client": [],
      "api_key": [
        {
          "current_key": "AIzaSy..."
        }
      ],
      "services": {
        "appinvite_service": {
          "other_platform_oauth_client": []
        }
      }
    }
  ],
  "configuration_version": "1"
}
```

---

## ⚠️ هام جداً

1. **لا ترفع الملف إلى Git:**
   - ✅ تأكد من وجود `android/app/google-services.json` في `.gitignore`
   - ✅ الملف موجود بالفعل في `.gitignore` في المشروع

2. **حماية المفاتيح:**
   - 🔒 `google-services.json` يحتوي على مفاتيح API
   - 🔒 لا تشاركه علناً أو في repositories عامة

3. **بيئات مختلفة:**
   - للتطوير: استخدم مشروع Firebase تجريبي
   - للإنتاج: استخدم مشروع Firebase منفصل بمفاتيح مختلفة

---

## 🔗 روابط مفيدة

- Firebase Console: https://console.firebase.google.com/
- دليل Firebase Android: https://firebase.google.com/docs/android/setup
- دليل FCM: https://firebase.google.com/docs/cloud-messaging/android/client

---

## ✅ الخطوات التالية (بعد إضافة google-services.json)

1. ✅ أعد بناء المشروع: `npm run build`
2. ✅ مزامنة Capacitor: `npx cap sync android`
3. ✅ اختبر الإشعارات على جهاز حقيقي
4. ✅ تأكد من عمل FCM من Firebase Console

---

**ملاحظة:** هذا الملف ضروري لعمل الإشعارات على Android. بدونه، سيعمل التطبيق لكن بدون push notifications.
