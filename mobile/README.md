# Duaii Native Mobile App (Expo)

تطبيق دوائي الأصلي — تطبيق البحث عن الأدوية والصيدليات القريبة (React Native + Expo).

## المميزات
- **تسجيل دخول آمن** عبر Supabase Auth
- **خرائط حية** وتحديد الصيدليات القريبة بـ GPS
- **إشعارات فورية** عند وصول وصفتك إلى الصيدلية
- **رفع وصفات** (صور + ملفات PDF) إلى التخزين الآمن
- **ملف شخصي** وإدارة البيانات الشخصية
- **تطبيق حقيقي** بدون WebView — أداء أصلي 100%

## المتطلبات الأساسية
- Node.js 20+
- Android Studio (لمحاكي أندرويد)
- Expo Go على الهاتف (لاختبار بدون بناء)
- Xcode (لـ iOS — macOS فقط)

## الإعداد السريع
```bash
cd mobile
npm install
```

أضف `.env` في مجلد `mobile`:
```
EXPO_PUBLIC_SUPABASE_URL=https://...supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## التشغيل

### على محاكي أندرويد
```bash
npm run android
```

### على جهازك (Expo Go)
```bash
npm start
# ضع الكود في تطبيق Expo Go
```

### على iOS (macOS فقط)
```bash
npm run ios
```

## البناء والإصدار

### EAS Build (موصى به)
```bash
npx eas login
npx eas build --platform android
npx eas submit --platform android
```

### محلي (أندرويد)
```bash
cd android
./gradlew assembleRelease
# ستجد الـ APK في: android/app/build/outputs/apk/release/
```

## الملفات الرئيسية
- `App.tsx` — نقطة البداية والتنقّل بين الشاشات
- `src/screens/` — شاشات الحواسيب (Auth, Home, Pharmacies, etc.)
- `src/lib/supabase.ts` — عميل Supabase
- `app.json` — إعدادات Expo والأذونات
- `eas.json` — إعدادات البناء الإصدار عبر EAS

## الخطوات القادمة
- [ ] تفعيل Google Sign-In
- [ ] إضافة Dark Mode
- [ ] رفع إلى Google Play Store
- [ ] تجميع لـ iOS و App Store
- [ ] Push notifications من الـ backend

## الدعم
للمساعدة، راجع:
- [Expo Docs](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org)
- [Supabase](https://supabase.io/docs)
