import type React from "react"
import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { FlowProvider } from '@/hooks/use-flow'
import { PWARegisterGate } from "@/components/client-boundaries/pwa-register-gate"
import { PermissionsRequestGate } from "@/components/client-boundaries/permissions-request-gate"
import { OnboardingGate } from "@/components/client-boundaries/onboarding-gate"
import { WelcomeScreenGate } from "@/components/client-boundaries/welcome-screen-gate"
import { OfflineGate } from "@/components/client-boundaries/offline-gate"
import { OfflineIndicator } from "@/components/offline-indicator"
import { OfflineSyncInit } from "@/components/offline-sync-init"
import { ErrorBoundary } from "@/components/error-boundary"
import Footer from '@/components/layout/footer'
import ClientInit from '@/components/sentry/ClientInit'
import "./globals.css"
import "leaflet/dist/leaflet.css"

const cairo = Cairo({
  subsets: ["latin", "arabic"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "دوائي - تطبيق الصيدليات",
  description: "اربط مع أقرب صيدلية واحصل على أدويتك بسهولة",
  generator: "دوائي",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "دوائي",
  },
  formatDetection: {
    telephone: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body suppressHydrationWarning className={`${cairo.className} font-sans antialiased cute-bg`}>
        <ErrorBoundary>
          <OfflineIndicator />
          <OfflineSyncInit />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ClientInit />
            <OfflineGate>
              <FlowProvider>
                <WelcomeScreenGate />
                <PermissionsRequestGate />
                <PWARegisterGate />
                <OnboardingGate>
                  {children}
                  <Footer />
                  <Toaster />
                </OnboardingGate>
              </FlowProvider>
            </OfflineGate>
          </ThemeProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
