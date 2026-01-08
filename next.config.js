const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        // Support signed URLs returned by API
        pathname: '/storage/v1/object/sign/**',
      },
    ],
    domains: ['nbdytzfnzccwshagzpeu.supabase.co'],
  },
  // Keep source maps in production builds to aid Sentry debugging (upload maps to Sentry for best results)
  productionBrowserSourceMaps: true,
  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript checks during builds
  typescript: {
    ignoreBuildErrors: true,
  },
};

// Sentry configuration
const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin
  silent: true, // Suppresses source map uploading logs during build
  org: "duaii", // TODO: Replace with your Sentry organization
  project: "duaii-app", // TODO: Replace with your Sentry project
};

// Make sure adding Sentry options is the last code to run before exporting
module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);

