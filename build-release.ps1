# DuaIII APK Build Script (PowerShell)
# Run: .\build-release.ps1

Write-Host "🚀 DuaIII Build Script" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build web assets
Write-Host "📦 Building Next.js production build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Build failed" -ForegroundColor Red
  exit 1
}
Write-Host "✅ Web build complete" -ForegroundColor Green
Write-Host ""

# Step 2: Sync with Capacitor
Write-Host "📱 Syncing with Android..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Capacitor sync failed" -ForegroundColor Red
  exit 1
}
Write-Host "✅ Capacitor sync complete" -ForegroundColor Green
Write-Host ""

# Step 3: Build Android AAB
Write-Host "🏗️  Building Android App Bundle (AAB)..." -ForegroundColor Yellow
Push-Location android
.\gradlew.bat bundleRelease
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Android build failed" -ForegroundColor Red
  Pop-Location
  exit 1
}
Pop-Location
Write-Host "✅ Android build complete" -ForegroundColor Green
Write-Host ""

# Find and display output
$AAB_PATH = "android\app\build\outputs\bundle\release\app-release.aab"
if (Test-Path $AAB_PATH) {
  $SIZE = (Get-Item $AAB_PATH).Length / 1MB
  Write-Host "✅ Build successful!" -ForegroundColor Green
  Write-Host ""
  Write-Host "📁 Output: $AAB_PATH" -ForegroundColor Cyan
  Write-Host "📊 Size: $([Math]::Round($SIZE, 2)) MB" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "🎯 Next steps:" -ForegroundColor Yellow
  Write-Host "1. Upload AAB to Google Play Console"
  Write-Host "2. Or build APK for testing: cd android; .\gradlew.bat assembleRelease"
  Write-Host "3. Test APK: adb install android\app\build\outputs\apk\release\app-release.apk"
} else {
  Write-Host "❌ AAB not found at: $AAB_PATH" -ForegroundColor Red
  exit 1
}
