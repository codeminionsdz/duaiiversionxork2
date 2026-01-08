import type { CapacitorConfig } from '@capacitor/cli'

// NOTE: webDir should point to the static export used inside the native shell.
// If you rely on the remote server.url (recommended for SSR Next.js), the webDir
// is used only for the splash bundle, so keep it lightweight but valid.
const config: CapacitorConfig = {
  appId: 'com.duaiii.app',
  appName: 'Duaii',
  webDir: 'out', // set to Next.js static export output
  server: {
    // Point native shell to the deployed web app; fallback to local dev
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    cleartext: false,
    allowNavigation: ['*'],
  },
  android: {
    webContentsDebuggingEnabled: false,
  },
}

export default config
