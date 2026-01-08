#!/bin/bash
# Mobile app build and test script

set -e

echo "📱 Building Duaii Mobile App..."

cd mobile

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for preview (APK)
echo "🔨 Building APK (preview)..."
npx eas build --platform android --profile preview --wait --non-interactive

echo "✅ Mobile app build complete!"
echo "📲 APK ready for testing and distribution."
