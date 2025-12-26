# 🚀 بناء APK مباشرة من Command Line

## الخطوات:

### 1. البناء من Gradle (بدون Android Studio)

```powershell
cd c:\Users\codem\OneDrive\project\duaii\android

# بناء Release APK
.\gradlew assembleRelease

# أو بناء AAB (الأفضل للمتاجر)
.\gradlew bundleRelease
```

### 2. الملفات الناتجة:

**APK:**
```
android/app/build/outputs/apk/release/app-release.apk
```

**AAB (للمتاجر):**
```
android/app/build/outputs/bundle/release/app-release.aab
```

### 3. التحقق من التوقيع:

```powershell
# التحقق من أن APK موقّع
$env:Path = "C:\Program Files\Java\jdk-25\bin;$env:Path"
jarsigner -verify -verbose android\app\build\outputs\apk\release\app-release.apk
```

---

## ⚠️ لو حدثت مشاكل:

### خطأ: Gradle wrapper not found

```powershell
cd android
gradle wrapper
./gradlew assembleRelease
```

### خطأ: ANDROID_SDK_ROOT not set

```powershell
$env:ANDROID_SDK_ROOT = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"
$env:Path = "$env:ANDROID_SDK_ROOT\platform-tools;$env:Path"
```

---

## ✅ بعد البناء:

- افحص الملف الناتج
- جرّبه على emulator أو جهاز
- رفعه على Google Play Console
