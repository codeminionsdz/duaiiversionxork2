# 🚀 APK Deployment Guide - DuaIII

## ✅ Build Status
- **Production Build**: ✅ COMPLETE (Next.js build output in `.next/`)
- **Build Size**: ~205KB first load JS
- **Warnings**: Sentry config deprecation (non-blocking)

---

## 📱 Step 1: Capacitor Setup

### 1.1 Sync with Android Project
```powershell
npx cap sync android
```
This will:
- Copy web assets to `android/app/src/main/assets/www/`
- Update Android native dependencies
- Generate required configuration files

### 1.2 Open Android Studio
```powershell
npx cap open android
```

---

## 🔑 Step 2: Android Signing Configuration

### 2.1 Create Signing Key (First Time Only)
If you haven't created a keystore yet:

```powershell
# Generate keystore (interactive - it will ask for passwords and details)
keytool -genkey -v -keystore release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias duaiii

# Expected output: release-key.jks file in project root
```

**Save these details securely:**
- Keystore password: ___________
- Key alias: duaiii
- Key password: ___________

### 2.2 Configure Signing in Android Project

In `android/app/build.gradle`, find the `buildTypes` section:

```gradle
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

Add before `buildTypes`:

```gradle
signingConfigs {
    release {
        keyStore file('release-key.jks')
        keyStorePassword "YOUR_KEYSTORE_PASSWORD"
        keyAlias "duaiii"
        keyPassword "YOUR_KEY_PASSWORD"
    }
}
```

---

## 📦 Step 3: Build Release APK

### 3.1 Build APK
```powershell
cd android
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
```

### 3.2 Build AAB (For Google Play Store - RECOMMENDED)
```powershell
cd android
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

**Note:** AAB format is required for Google Play Store and allows optimized download sizes per device.

---

## 🎯 Step 4: Test the Build

### 4.1 Test APK on Device
```powershell
# Connect Android device via USB or use emulator
adb install android/app/build/outputs/apk/release/app-release.apk
```

### 4.2 Launch App
- Open "DuaIII" on device
- Test key flows:
  - User signup and login
  - Upload prescription
  - Pharmacy searching
  - Image display (verify images load with signed URLs)
  - Notifications

---

## 🏪 Step 5: Google Play Store Submission

### 5.1 Create Google Play Developer Account
- Cost: $25 one-time
- Visit: https://play.google.com/console/signup
- Provide billing information and developer details

### 5.2 Create New App
1. In Play Console → Select "Create App"
2. Fill in app details:
   - **App name**: DuaIII
   - **Default language**: Arabic (العربية)
   - **App category**: Medical (if available) or Healthcare
   - **Free or paid**: Free

### 5.3 Prepare Store Assets

You'll need these images (in JPEG/PNG):

| Asset | Size | Notes |
|-------|------|-------|
| **App Icon** | 512×512px | High-quality, no rounded corners |
| **Feature Graphic** | 1024×500px | Banner showing app features |
| **Screenshots** | 1080×1920px | 2-5 screenshots (min. required) |
| **Privacy Policy** | Text | Already at `/privacy-policy` |
| **Terms of Service** | Text | Already at `/terms-of-service` |

**Screenshot Example Content:**
1. Login/Signup screen
2. Upload prescription screen
3. Search pharmacies screen
4. Pharmacy details with medicines
5. Notification example

### 5.4 Fill App Metadata in Play Console

**Tabletop → App details:**
- Title: DuaIII
- Short description: "Find nearby pharmacies and get your medicines delivered fast"
- Full description (500-4000 chars):

```
DuaIII - Your Trusted Pharmacy Delivery App

Features:
✓ Upload prescriptions instantly
✓ Find nearby pharmacies with real prices
✓ Direct communication with pharmacies
✓ Track medicine delivery
✓ Price comparison between pharmacies
✓ Secure payment integration
✓ Real-time notifications
✓ Arabic & multi-language support

Why Choose DuaIII?
- Fast delivery to your doorstep
- Verified pharmacies
- Competitive pricing
- Privacy-first approach
- 24/7 customer support

Download now and get your medicines delivered safely!
```

**Tabletop → Audience:**
- Target age group: 13+
- Permissions: Review all requested Android permissions

---

## 📋 Step 6: Submit AAB to Play Console

### 6.1 Upload Build
1. In Play Console → Your app → Release → Production
2. Click "Create new release"
3. Upload AAB file: `android/app/build/outputs/bundle/release/app-release.aab`
4. Accept Google Play signing (recommended)
5. Add release notes (version 1.0 - Initial release)

### 6.2 Review Before Publishing
- Test on internal test track first
- Add testers (QA team)
- Monitor for crashes
- Fix any issues and re-upload

### 6.3 Publish
1. All review items must be completed (store listing, privacy policy, content rating, etc.)
2. Click "Send for review"
3. Google Play typically reviews in 24-48 hours
4. You'll receive email notification when approved

---

## 🔒 Security Checklist Before Submission

- [ ] Environment variables are in `.env.local` (not committed)
- [ ] Supabase service role key is server-side only (not exposed in client)
- [ ] Privacy policy covers data collection
- [ ] Terms of service are available
- [ ] Error pages display for all error scenarios
- [ ] Authentication flows are secure
- [ ] Image uploads are validated
- [ ] Rate limiting is in place for APIs
- [ ] HTTPS is enforced in production

---

## 📊 Version Management

For future releases, update:

1. **package.json**: `"version": "1.0.1"`
2. **android/app/build.gradle**: 
   ```gradle
   versionCode 101  // Must increment
   versionName "1.0.1"
   ```
3. **capacitor.config.ts**: 
   ```typescript
   appVersion: "1.0.1"
   ```

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| APK doesn't install | Check Android version compatibility (min: Android 7.0) |
| Images don't load | Verify signed URL API is responding at `/api/images/signed-url` |
| Build fails with permission error | Run Android Studio as admin |
| Play Store upload fails | Check AAB size (typical: 30-50MB) |
| App crashes on startup | Check Firebase configuration in `.env.local` |

---

## ✅ Deployment Checklist

- [ ] npm run build completes with no errors
- [ ] npx cap sync android succeeds
- [ ] Keystore created and passwords saved securely
- [ ] Gradle build succeeds (./gradlew bundleRelease)
- [ ] AAB tested on device/emulator
- [ ] All key features tested (signup, upload, search, notifications)
- [ ] Google Play Developer account created
- [ ] Store assets prepared (screenshots, icon)
- [ ] App metadata filled in Play Console
- [ ] Privacy policy and ToS published
- [ ] Build uploaded to internal test track
- [ ] Beta testing completed
- [ ] Ready for production release

---

## 📞 Support

For issues with:
- **Capacitor**: https://capacitorjs.com/docs
- **Android Build**: https://developer.android.com/build
- **Google Play**: https://support.google.com/googleplay/android-developer

---

**Last Updated:** 2024
**Next.js Build**: 14.1.0
**Target SDK**: Android 14+
