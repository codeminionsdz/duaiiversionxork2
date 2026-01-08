#!/bin/bash
# DuaIII APK Build Script

echo "🚀 DuaIII Build Script"
echo "======================="
echo ""

# Step 1: Build web assets
echo "📦 Building Next.js production build..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi
echo "✅ Web build complete"
echo ""

# Step 2: Sync with Capacitor
echo "📱 Syncing with Android..."
npx cap sync android
if [ $? -ne 0 ]; then
  echo "❌ Capacitor sync failed"
  exit 1
fi
echo "✅ Capacitor sync complete"
echo ""

# Step 3: Build Android AAB
echo "🏗️  Building Android App Bundle (AAB)..."
cd android
./gradlew bundleRelease
if [ $? -ne 0 ]; then
  echo "❌ Android build failed"
  exit 1
fi
echo "✅ Android build complete"
echo ""

# Find and display output
AAB_PATH="app/build/outputs/bundle/release/app-release.aab"
if [ -f "$AAB_PATH" ]; then
  SIZE=$(du -sh "$AAB_PATH" | cut -f1)
  echo "✅ Build successful!"
  echo ""
  echo "📁 Output: $AAB_PATH"
  echo "📊 Size: $SIZE"
  echo ""
  echo "🎯 Next steps:"
  echo "1. Upload to Google Play Console"
  echo "2. Or build APK for testing: ./gradlew assembleRelease"
else
  echo "❌ AAB not found at expected location"
  exit 1
fi
