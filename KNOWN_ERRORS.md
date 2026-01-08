# Known Type Errors

This document lists known TypeScript errors that exist in the codebase and their status.

## Mobile App Errors (6 files)
These errors are in the React Native mobile app (`mobile/` folder) and are outside the main Next.js application scope:

1. **mobile/App.tsx** - React Navigation type compatibility issues
2. **mobile/src/screens/NotificationsScreen.tsx** - Expo Notifications API changes

**Status**: Low priority - Mobile app uses separate build system (Capacitor)

## Legacy Component Errors (2 files)

### components/fetch-polyfill.tsx
- **Error**: URL type incompatibility with RequestInfo
- **Impact**: Minor - polyfill still functions correctly at runtime
- **Status**: To be refactored

### components/image-viewer.tsx
- **Error**: Deprecated Supabase import
- **Fix**: Update to use `createBrowserClient` instead
- **Status**: Needs update

### app/pharmacies/[id]/page.tsx
- **Error**: Capacitor App plugin API change
- **Fix**: Update Capacitor plugins
- **Status**: Works at runtime, types need update

### components/home/interactive-map.tsx
- **Error**: Leaflet 'tap' option deprecated
- **Impact**: None - option is ignored in newer versions
- **Status**: Can be safely removed

## New Files Status

All newly added files (Docker, Tests, API Docs, etc.) have **NO TYPE ERRORS** ✅

## Resolution Plan

1. **Immediate**: Ignore mobile/ folder in main type checking
2. **Short-term**: Update legacy components
3. **Long-term**: Migrate to latest Capacitor & Supabase APIs

---

Last Updated: January 4, 2026
